<template>
  <div v-if="!$cookies.isKey('authToken')">
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col lg="5">
          <b-alert :show="serverError" variant="danger"> {{ serverErrorMsg }}</b-alert>
        </b-col>
      </b-row>

      <b-form novalidate @submit.stop.prevent="onSubmit">
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-form-group>
              <label>Email <span style="color:red;">*</span></label>
              <b-form-input
                required
                :state="validateFormState('emailAddress')"
                v-model="$v.form.emailAddress.$model"
                placeholder="Enter email">
              </b-form-input>
              <b-form-invalid-feedback>
                {{ form.emailErrorMsg }}
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
                type="password"
                :state="validateFormState('password')"
                v-model="$v.form.password.$model"
                placeholder="Enter password">
              </b-form-input>
              <b-form-invalid-feedback>
                {{ form.passwordErrorMsg }}
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
          <b-col lg="5">
            <b-button type="submit" block>Log in</b-button>
          </b-col>
        </b-row>

      </b-form>

    </b-container>
  </div>
  <div v-else>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col lg="9">
          <b-alert show style="text-align: center">You are already logged in, please log out first to log in to a different user</b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>

</template>

<script>
  import {required, email, minLength} from "vuelidate/lib/validators";

  export default {
    name: "Login",
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        form: {
          emailAddress: "",
          password: "",
          error: false,
          emailErrorMsg: "This field must be an email",
          passwordErrorMsg: "This field must be provided",
          submitted: false
        },
        serverError: false,
        serverErrorMsg: "",
      }
    },
    validations: {
      form: {
        emailAddress: {
          required,
          email,
        },
        password: {
          required
        }
      }
    },
    methods: {
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

        let loginData = {
          email: this.form.emailAddress,
          password: this.form.password
        }

        this.postUserLogin(loginData);
      },
      postUserLogin: function (loginData) {
        this.$http.post(this.serverUrl + "/users/login", loginData)
          .then((response) => {
            if (response.status == 200) {
              this.$cookies.set("authToken", response.data.token);
              this.$cookies.set("userId", response.data.userId);

              this.$router.push("/")
            }
          })
          .catch((error) => {
            if (error.response.status == 400) {
              this.serverError = true;
              this.serverErrorMsg = "Invalid email or password";
              this.form.password = "";
              this.form.submitted = false;
            } else if (error.response.status == 500) {
              this.serverError = true;
              this.serverErrorMsg = "Internal server error, please try again later";
              this.form.password = "";
              this.form.submitted = false;
            }
            console.log(error);
          });
      }

    }
  }
</script>

<style scoped>

</style>
