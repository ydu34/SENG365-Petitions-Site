<template>
  <div>
    <b-navbar toggleable="lg" type="dark" style="background-color:darkcyan;">
      <router-link to="/" tag="b-navbar-brand" class="clickable">Take Action</router-link>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <router-link to="/petitions/create" tag="b-nav-item">Create a petition</router-link>
          <router-link to="/petitions" tag="b-nav-item">Browse petitions</router-link>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto" v-if="isLoggedIn">
          <router-link to="/" tag="b-nav-item">Home</router-link>
          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template v-slot:button-content>
              User
            </template>
            <b-dropdown-item @click="goToEditProfile()">Edit Profile</b-dropdown-item>
            <b-dropdown-item @click="postUsersLogout">Log out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto" v-else>
          <router-link to="/users/login" tag="b-nav-item">Log in</router-link>
          <router-link to="/users/register" tag="b-nav-item">Sign up</router-link>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>

  export default {

    name: "NavBar",
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
      }
    },
    computed: {
      isLoggedIn: function() {
        return this.$cookies.isKey("authToken");
      }
    },
    methods: {
      postUsersLogout: function () {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        this.$http.post(this.serverUrl + "/users/logout", null, {headers: headers})
        .then((response) => {
          if (response.status==200) {
            this.$cookies.remove("authToken");
            this.$cookies.remove("userId");
            if (this.$route.path == "/") {
              this.$router.go(0)
            } else {
              this.$router.push("/");
            }
          }
        })
        .catch((error) => {
          if (error.response.status==500) {

          }
        })
      },
      goToEditProfile: function () {
        let path = "/users/"+this.$cookies.get("userId")+"/edit";
        if (this.$route.path == path) {
          this.$router.go(0);
        }
        this.$router.push(path);
      }
    },
    watch: {

    }

  }
</script>

<style scoped>
  *:focus {
    outline: none;
  }
</style>
