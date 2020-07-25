<template>
  <div v-if="getAuthToken">
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-card>
            <b-row>
              <b-col>
                <h3 style="text-align: center">Create a petition</h3>
              </b-col>
            </b-row>
            <b-form novalidate @submit.stop.prevent="onSubmit">
              <b-row>
                <b-col>
                  <b-form-group>
                    <label>
                      Image: <span style="color:red;">*</span>
                    </label>
                    <b-form-file
                      no-drop
                      accept="image/jpeg, image/png, image/gif"
                      :state="validateFormState('photoFile')"
                      v-model="$v.form.photoFile.$model"
                      placeholder="Browse and select an image"
                      v-on:input="getImageUrl"
                    ></b-form-file>

                    <b-form-invalid-feedback>
                      {{form.photoFileErrMsg}}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-img :src="form.photoFileUrl" fluid center></b-img>
                </b-col>
              </b-row>
              <br>
              <b-row>
                <b-col>
                  <b-form-group>
                    <label>Title <span style="color:red;">*</span></label>
                    <b-form-input
                      required
                      :state="validateFormState('title')"
                      v-model="$v.form.title.$model"
                      placeholder="Enter title">
                    </b-form-input>
                    <b-form-invalid-feedback>
                      {{form.titleErrMsg}}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-form-group>
                    <label>Description <span style="color:red;">*</span></label>
                    <b-form-textarea
                      required
                      :state="validateFormState('description')"
                      v-model="$v.form.description.$model"
                      placeholder="Tell us about the goals of the petition"
                      rows="10"
                    >
                    </b-form-textarea>
                    <b-form-invalid-feedback>
                      {{form.descriptionErrMsg}}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-form-group>
                    <label>Category <span style="color:red;">*</span></label>
                    <b-form-select
                      required
                      :state="validateFormState('category')"
                      v-model="$v.form.category.$model"
                      :options="form.categoryOptions">

                    </b-form-select>
                    <b-form-invalid-feedback>
                      {{form.categoryErrMsg}}
                    </b-form-invalid-feedback>
                  </b-form-group>

                </b-col>
              </b-row>
              <b-form-group>
                <b-row>
                  <b-col><label>Closing Date</label></b-col>

                </b-row>

                <b-row>
                  <b-col>
                    <b-form-input
                      :state="validateFormState('closingDate')"
                      v-model="$v.form.closingDate.$model"
                      type="date">

                    </b-form-input>

                    <b-form-invalid-feedback>
                      {{form.closingDateErrMsg}}
                    </b-form-invalid-feedback>
                  </b-col>
                  <b-col>
                    <b-form-input
                      :state="validateFormState('closingTime')"
                      v-model="$v.form.closingTime.$model"
                      type="time">

                    </b-form-input>
                    <b-form-invalid-feedback>
                      {{form.closingTimeErrMsg}}
                    </b-form-invalid-feedback>
                  </b-col>

                </b-row>
                <b-form-text>Time is defaulted to 12:00AM if date is specifed and time is not specified</b-form-text>
              </b-form-group>
              <b-row>
                <b-col>
                  <b-button type="submit" block>Submit</b-button>
                </b-col>
              </b-row>
              <br>
              <b-row>
                <b-col>
                  <b-alert :show="serverErrMsg != null" variant="danger">{{ serverErrMsg }}</b-alert>
                </b-col>
              </b-row>
            </b-form>
          </b-card>
        </b-col>
      </b-row>

    </b-container>
  </div>
  <div v-else>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-alert show style="text-align: center">You must be logged in to create a petition</b-alert>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <router-link to="/users/login" tag="b-button" style="float:right; width: 100px">Log in</router-link>
        </b-col>

        <b-col>
          <router-link to="/users/register" tag="b-button" style="width: 100px">Sign up</router-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import {required, minLength, minValue} from "vuelidate/lib/validators";

  export default {
    name: "PetitionCreate",
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        petition: null,
        form: {
          title: "",
          photoFile: null,
          description: "",
          category: null,
          categoryOptions: [{value: null, text: 'Please select a category'}],
          closingDate: "",
          closingTime: "",
          photoFileUrl: "",
          titleErrMsg: "A title is required",
          photoFileErrMsg: "An image must be provided",
          descriptionErrMsg: "A description is required",
          categoryErrMsg: "A category must be selected",
          closingDateErrMsg: "",
          closingTimeErrMsg: ""
        },
        submitted: false,
        serverErrMsg: null,
      }
    },
    validations: {
      form: {
        title: {
          required,
          minLength: minLength(1)
        },
        description: {
          required
        },
        category: {
          required
        },
        photoFile: {
          required
        },
        closingDate: {
          checkDateTime() {
            if (this.form.closingTime && !this.form.closingDate) {
              this.form.closingDateErrMsg = "Time cannot be specified without date"
              return false;
            }
            if (this.form.closingDate) {
              let dateTime;
              if (this.form.closingTime) {
                dateTime = new Date(this.form.closingDate + "T" + this.form.closingTime);
              } else {
                dateTime = new Date(this.form.closingDate + "T00:00:00.000" );
              }
              if (dateTime <= new Date()) {
                this.form.closingDateErrMsg = "Date and time cannot be in the past"
                return false
              }
            }
            return true;
          },
        },
        closingTime: {
          checkDateTime() {
            if (this.form.closingTime && !this.form.closingDate) {
              this.form.closingTimeErrMsg = "Time cannot be specified without date"
              return false;
            } else if (new Date(this.form.closingDate + "T" + this.form.closingTime) <= new Date()) {
              this.form.closingTimeErrMsg = "Date and time cannot be in the past"
              return false;
            } else {
              return true;
            }
          }
        }

      }
    },
    computed: {
      getAuthToken: function () {
        return this.$cookies.get("authToken");
      },
    },
    methods: {
      getImageUrl: function () {
        if (this.form.photoFile) {
          let vueObj = this;
          var fr = new FileReader();
          fr.addEventListener("load", function () {
            vueObj.form.photoFileUrl = fr.result;

          }, false);
          fr.readAsDataURL(this.form.photoFile);
        }
      },

      validateFormState: function (name) {
        const {$dirty, $error} = this.$v.form[name];
        return (this.submitted && $dirty && $error) ? false : null;
      },
      onSubmit: function () {
        this.submitted = true;
        this.$v.form.$touch();
        if (this.$v.form.$anyError) {
          return;
        }
        this.postPetition()
          .then((response) => {
            let petitionId = response.data.petitionId;
            this.postPetitionsSignature(petitionId)
              .then(() => {
                this.putPetitionPhoto(petitionId)
                  .then(() => {
                    this.$router.push("/petitions/" + response.data.petitionId)
                  })
              })
          })
          .catch((error) => {
            this.serverErrMsg = error.response.statusText;
            console.log(error);
          });
      },
      postPetition: function () {
        let closingDateTime;
        if (this.form.closingDate) {
          closingDateTime = this.form.closingDate;
        }
        if (this.form.closingTime) {
          closingDateTime += " " + this.form.closingTime;
        }
        let petitionData = {
          title: this.form.title,
          description: this.form.description,
          categoryId: this.form.category,
        }
        if (closingDateTime) {
          petitionData.closingDate = closingDateTime
        }
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        return this.$http.post(this.serverUrl + "/petitions", petitionData, {headers: headers});
      },
      putPetitionPhoto: function (id) {
        let headers = {
          'Content-Type': this.form.photoFile.type,
          "X-Authorization": this.$cookies.get("authToken")
        }
        return this.$http.put(this.serverUrl + "/petitions/" + id + "/photo", this.form.photoFile, {headers: headers});
      },
      postPetitionsSignature: function (id) {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        return this.$http.post(this.serverUrl + "/petitions/" + id + "/signatures", null, {headers: headers});
      },
      getPetitionsCategories: function () {
        this.$http.get(this.serverUrl + "/petitions/categories")
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              this.form.categoryOptions.push({
                value: response.data[i].categoryId,
                text: response.data[i].name
              })
            }
          })
          .catch((error) => {
            console.log(error);
          })
      },
    },
    beforeMount() {
      this.getPetitionsCategories();
    }
  }
</script>

<style scoped>

</style>
