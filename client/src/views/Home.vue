<template>
  <div>
    <b-container v-if="$cookies.isKey('userId') && user">
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-card>
            <b-media>

              <template v-slot:aside>
                <div>
                  <b-img v-bind:src="'http://localhost:4941/api/v1/users/'+getUserId+'/photo'"
                         rounded class="avatarBig" @error="imageUrlAlt"></b-img>
                </div>

              </template>
              <h2>{{ user.name }}</h2>
              <div><b>Email:</b> {{ user.email }}</div>
              <div v-if="user.city"><b>City:</b> {{ user.city }}</div>
              <div v-else><b>No city</b></div>
              <div v-if="user.country"><b>Country:</b> {{ user.country }}</div>
              <div v-else><b>No country</b></div>

            </b-media>
          </b-card>

        </b-col>
      </b-row>
      <div>
        <b-row class="justify-content-md-center">
          <b-col cols="9">
            <hr>
            <h2 style="text-align: center"> My Petitions </h2>
            <hr>
          </b-col>
        </b-row>
        <b-row>
          <b-col v-if="petitions.length > 0">
            <PetitionsList v-bind:petitions="petitions"></PetitionsList>
          </b-col>
          <b-col v-else>
            <h6 style="text-align: center">No petitions yet! Take action and create one!</h6>
          </b-col>
        </b-row>
      </div>


    </b-container>


    <b-container v-else-if="!$cookies.isKey('authToken')">
      <b-row class="justify-content-md-center">
        <b-col>
          <h1 style="text-align: center">Welcome to Take Action</h1>
          <p style="text-align: center">Take action and change the future</p>
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
  import PetitionsList from "../components/PetitionsList"

  export default {
    name: "Home",
    components: {
      PetitionsList
    },
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        user: null,
        petitions: []
      }
    },
    methods: {
      getUser: function () {
        if (this.$cookies.isKey("userId")) {
          let headers = {
            "X-Authorization": this.$cookies.get("authToken")
          }
          this.$http.get(this.serverUrl + "/users/" + this.$cookies.get("userId"), {headers: headers})
            .then((response) => {
              this.user = response.data;
            })
        }
      },
      imageUrlAlt: function (event) {
        event.target.src = "/src/assets/default_user.png";
      },
      getOwnPetitions() {
        let params = {
          authorId: this.$cookies.get("userId")
        }
        this.getPetitions(params)
          .then((response) => {
            this.petitions = response.data;
          })
          .catch((error) => {
            console.log(error);
          })
      },
      getPetitions(params) {
        return this.$http.get(this.serverUrl + "/petitions", {params: params});
      }
    },
    mounted: function () {
      this.getUser();
      this.getOwnPetitions();
    },
    computed: {
      getUserId: function () {
        return this.$cookies.get("userId");
      }
    }
  }
</script>

<style scoped>

</style>
