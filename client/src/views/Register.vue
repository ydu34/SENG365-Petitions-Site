<template>
  <div v-if="!$cookies.isKey('authToken')">
    <b-container>

      <b-form novalidate @submit.stop.prevent="onSubmit">


        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group>
              <label>Name <span style="color:red;">*</span></label>
              <b-form-input
                required
                :state="validateFormState('name')"
                v-model="$v.form.name.$model"
                placeholder="Enter name">
              </b-form-input>
              <b-form-invalid-feedback>
                Name must be minimum length of 1
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group>
              <label>Email <span style="color:red;">*</span></label>
              <b-form-input
                required
                :state="validateFormState('email')"
                type="email"
                v-model="$v.form.email.$model"
                placeholder="Enter email">
              </b-form-input>
              <b-form-invalid-feedback>
                Please provide a valid email address
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group>
              <label>Password <span style="color:red;">*</span></label>
              <b-form-input
                required
                :state="validateFormState('password')"
                type="password"
                v-model="$v.form.password.$model"
                placeholder="Enter password">
              </b-form-input>
              <b-form-invalid-feedback>
                Password must be minimum length of 1
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group
              label="City">
              <b-form-input
                v-model="form.city"
                placeholder="Enter city">
              </b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group
              label="Country">
              <b-form-input
                v-model="form.country"
                placeholder="Enter country">
              </b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <label>
              Profile picture
            </label>
            <UserImageSelect v-on:childToParent="getImage"></UserImageSelect>
          </b-col>
        </b-row>
        <br>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-button type="submit" block>Sign up</b-button>
          </b-col>
        </b-row>
        <br>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-alert :show="serverErrMsg != null" variant="danger"> {{serverErrMsg}} </b-alert>
          </b-col>
        </b-row>

      </b-form>

    </b-container>
  </div>
  <div v-else>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col lg="9">
          <b-alert show style="text-align: center">You are currently logged in, please log out first to register another account</b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import {required, email, minLength} from "vuelidate/lib/validators";
  import UserImageSelect from "../components/UserImageSelect";

  export default {
    name: "Register",
    components: {UserImageSelect},
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        form: {
          name: "",
          email: "",
          password: "",
          city: "",
          country: "",
          submitted: false,
          imageFile: null
        },
        serverErrMsg: null,

      }
    },
    validations: {
      form: {
        name: {
          required,
          minLength: minLength(1)
        },
        email: {
          required,
          email,
          minLength: minLength(1)
        },
        password: {
          required,
          minLength: minLength(1)
        },
        city: {},
        country: {}
      }
    },

    methods: {
      getImage: function (value) {
        this.form.imageFile = value;
      },
      validateFormState: function (name) {
        const {$dirty, $error} = this.$v.form[name];
        return (this.form.submitted && $dirty && $error) ? false : null;
      },
      onSubmit: function () {
        this.form.submitted = true;
        this.$v.form.$touch();
        if (this.$v.form.$anyError) {
          return;
        }
        let data = {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password
        }
        if (this.form.city) {
          data.city = this.form.city;
        }
        if (this.form.country) {
          data.country = this.form.country;
        }
        this.$http.post(this.serverUrl + "/users/register", data)
          .then((response) => {
            if (response.status == 201) {
              let loginData = {
                email: this.form.email,
                password: this.form.password
              }
              this.postUserLogin(loginData);
            }
          })
          .catch((error) => {
            this.serverErrMsg = error.response.statusText;
            console.log(error);
          });
      },
      putUserPhoto: function () {
        if (this.form.imageFile) {
          let headers = {
            'Content-Type': this.form.imageFile.type,
            "X-Authorization": this.$cookies.get("authToken")
          }

          this.$http.put(this.serverUrl + "/users/" + this.$cookies.get("userId") + "/photo", this.form.imageFile, {
            headers: headers
          })
            .then((response) => {
              this.$router.push("/")
            })
            .catch((error) => {
              this.$router.push("/")
            })
        } else {
          this.$router.push("/");
        }
      },
      postUserLogin: function (loginData) {
        this.$http.post(this.serverUrl + "/users/login", loginData)
          .then((response) => {
            if (response.status == 200) {
              this.$cookies.set("authToken", response.data.token);
              this.$cookies.set("userId", response.data.userId);
              this.putUserPhoto();
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }
</script>

<style scoped>
</style>
