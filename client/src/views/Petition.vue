<template>

  <div>
    <div v-if="errorFlag" style="color: red;">
      {{ error }}
    </div>
    <b-container v-if="petition">
      <div>
        <div v-if="!petitionOpen">
          <b-row class="justify-content-md-center">
            <b-col cols="9">
              <b-alert show style="text-align: center" variant="info">This petition has closed</b-alert>
            </b-col>
          </b-row>
        </div>
        <b-row class="justify-content-md-center">
          <b-col cols="9">
            <b-card>
              <b-row>
                <b-col>
                  <b-card-title>
                    <h2 style="text-align:center;" v-if="petition">{{petition.title}}</h2>
                  </b-card-title>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-card-img v-if="petition"
                              v-bind:src='"http://localhost:4941/api/v1/petitions/"+petition.petitionId+"/photo"'
                              class="rounded-0">

                  </b-card-img>

                </b-col>
              </b-row>
              <hr>
              <b-row no-gutters>
                <b-col>
                  <h6 v-if="petition.signatureCount"> {{ petition.signatureCount }} have signed</h6>
                </b-col>

                <b-col cols="auto">
                  <b-button
                    class="right-button"
                    v-b-modal.share-modal
                  >
                    Share
                  </b-button>
                  <b-modal id="share-modal" title="Choose sharing method">

                    <ShareNetwork
                      network="facebook"
                      :url="'https://takeaction.co.nz'+this.$route.fullPath"
                    >
                      <b-button>Facebook</b-button>

                    </ShareNetwork>
                    <ShareNetwork
                      network="twitter"
                      :url="'https://takeaction.co.nz'+this.$route.fullPath"
                    >
                      <b-button>Twitter</b-button>

                    </ShareNetwork>
                    <ShareNetwork
                      network="reddit"
                      :url="'https://takeaction.co.nz'+this.$route.fullPath"
                    >
                      <b-button>Reddit</b-button>

                    </ShareNetwork>
                    <template v-slot:modal-footer>
                      <div>

                        <b-button
                          size="sm"
                          class="right-button"
                          @click="$bvModal.hide('share-modal')"

                        >
                          Close
                        </b-button>
                      </div>
                    </template>

                  </b-modal>


                </b-col>

                <b-col cols="auto" v-if="!ownPetition">
                  <b-button
                    class="right-button"
                    variant="success"
                    v-if="authenticated && !petitionSigned && petitionOpen"
                    @click="postPetitionsSignature($route.params.petitionId)"
                  >
                    Sign petition
                  </b-button>
                  <b-button
                    class="right-button"
                    variant="danger"
                    v-if="authenticated && petitionSigned && petitionOpen"
                    @click="deletePetitionsSignature($route.params.petitionId)"
                  >
                    Remove signature
                  </b-button>
                </b-col>
                <b-col v-if="ownPetition && petitionOpen" cols="auto">
                  <b-button
                    class="right-button"
                    @click="goToEdit"
                  >
                    Edit
                  </b-button>

                </b-col>
                <b-col v-if="ownPetition" cols="auto">
                  <b-button variant="danger" class="right-button" v-b-modal.delete-modal>
                    Delete
                  </b-button>
                  <b-modal id="delete-modal">
                    <p>Are you sure you want to delete this petition?</p>
                    <template v-slot:modal-footer>
                      <div>

                        <b-button
                          size="sm"
                          variant="danger"
                          class="right-button"
                          @click="deletePetition(petition.petitionId)"

                        >
                          Delete
                        </b-button>
                        <b-button
                          size="sm"
                          class="right-button"
                          @click="$bvModal.hide('delete-modal')"

                        >
                          Cancel
                        </b-button>
                      </div>
                    </template>
                  </b-modal>

                </b-col>
              </b-row>
              <hr>
              <b-row>
                <b-col>
                  <b>Category: </b> {{petition.category}}
                </b-col>
              </b-row>
              <hr>
              <b-row>
                <b-col cols="auto">
                  <b-media>
                    <b>Created Date:</b> {{ new Date(petition.createdDate).toString() }}
                    <br>
                    <div v-if="petition.closingDate"><b>Closing Date:</b> {{new Date(petition.closingDate).toString() }}
                    </div>
                    <div v-else><b>No closing date</b></div>
                  </b-media>
                </b-col>
              </b-row>
              <hr>
              <b-row>
                <b-col cols="auto">
                  <h4>Author</h4>
                </b-col>
                <b-col cols="auto">

                  <b-media>
                    <template v-slot:aside v-if="petition">
                      <div>
                        <b-img v-bind:src="'http://localhost:4941/api/v1/users/'+petition.authorId+'/photo'"
                               rounded="circle" class="avatar" @error="imageUrlAlt"></b-img>
                      </div>

                    </template>

                    <h5 class="mt-0">{{ petition.authorName }}</h5>
                    <div v-if="petition.authorCity">City: {{ petition.authorCity }}</div>
                    <div v-else>No city</div>
                    <div v-if="petition.authorCountry">Country: {{ petition.authorCountry }}</div>
                    <div v-else>No country</div>
                  </b-media>
                </b-col>


              </b-row>
              <hr>
              <b-row>
                <b-col>
                  <b-media>
                    {{ petition.description }}
                  </b-media>
                </b-col>
              </b-row>
              <hr>
              <b-row>
                <b-col>
                  <h4>Signatures</h4>
                </b-col>
                <b-col>
                  <h6 style="float:right;">{{ petition.signatureCount }} have signed</h6>
                </b-col>
              </b-row>

              <br>
              <div v-for="signature in signatures">
                <b-media>

                  <template v-slot:aside>
                    <div>
                      <b-img v-bind:src="'http://localhost:4941/api/v1/users/'+signature.signatoryId+'/photo'"
                             rounded class="avatarSmall" @error="imageUrlAlt"></b-img>
                    </div>

                  </template>
                  <h6>{{ signature.name }}</h6>
                  <div v-if="signature.city">City: {{ signature.city }}</div>
                  <div v-else>No city</div>
                  <div v-if="signature.country">Country: {{ signature.country }}</div>
                  <div v-else>No country</div>

                  <hr>
                </b-media>
                <br>
              </div>

            </b-card>
          </b-col>
        </b-row>
      </div>

    </b-container>
  </div>

</template>

<script>


  export default {

    name: "Petition",
    data() {
      return {
        petition: null,
        error: "",
        errorFlag: false,
        signatures: [],
        serverUrl: "http://localhost:4941/api/v1"
      }
    },
    mounted: function () {
      this.getPetition(this.$route.params.petitionId);
      this.getSignatures(this.$route.params.petitionId)
    },
    computed: {
      ownPetition: function () {
        return this.petition.authorId == this.$cookies.get("userId");
      },
      authenticated: function () {
        return this.$cookies.isKey("authToken");
      },
      petitionSigned: function () {
        for (let i = 0; i < this.signatures.length; i++) {
          if (this.signatures[i].signatoryId == this.$cookies.get("userId")) {
            return true;
          }
        }
        return false;
      },
      petitionOpen: function () {

        if (this.petition.closingDate) {
          if (new Date(this.petition.closingDate) <= new Date()) {

            return false;
          }
        }
        return true;
      }
    },
    methods: {
      getPetition: function (id) {
        this.$http.get(this.serverUrl + "/petitions/" + id)
          .then((response) => {
            this.petition = response.data;
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      imageUrlAlt: function (event) {
        event.target.src = "/src/assets/default_user.png";
      },
      getSignatures: function (id) {
        this.$http.get(this.serverUrl + "/petitions/" + id + "/signatures")
          .then((response) => {
            this.signatures = response.data;
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      deletePetition: function (id) {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        this.$http.delete(this.serverUrl + "/petitions/" + id, {headers: headers})
          .then((response) => {
            this.$router.push("/petitions")
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      goToEdit: function () {
        this.$router.push("/petitions/" + this.$route.params.petitionId + "/edit")
      },
      postPetitionsSignature: function (id) {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        this.$http.post(this.serverUrl + "/petitions/" + id + "/signatures", null, {headers: headers})
          .then((response) => {
            if (response.status == 201) {
              this.getSignatures(id);
              this.getPetition(id);
            }
          })
      },
      deletePetitionsSignature: function (id) {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        this.$http.delete(this.serverUrl + "/petitions/" + id + "/signatures", {headers: headers})
          .then((response) => {
            this.getSignatures(id);
            this.getPetition(id);
          })
      }
    }
  }
</script>

<style scoped>

</style>
