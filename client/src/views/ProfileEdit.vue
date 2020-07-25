<template>
  <div v-if="$cookies.isKey('authToken') && $cookies.get('userId') == $route.params.userId" >
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-card no-body>
            <b-tabs pill card vertical v-on:input="updateData()">
              <b-tab title="Profile picture">
                <b-form novalidate @submit.stop.prevent="changeProfilePicture">
                  <b-row>
                    <b-col>
                      <label>Profile picture</label>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-form-file
                        no-drop
                        accept="image/jpeg, image/png, image/gif"
                        v-model="profilePictureForm.imageFile"
                        placeholder="Browse and select an image"
                        v-on:input="getImageUrl(profilePictureForm.imageFile)"
                        v-on:change="resetProfilePictureFormAlert"
                      >
                      </b-form-file>
                      <b-form-text>
                        The image chosen will be cropped to a square
                      </b-form-text>
                    </b-col>
                    <b-col cols="auto">
                      <b-button
                        variant="danger"
                        @click="removeProfilePicture"
                      >
                        Remove
                      </b-button>
                    </b-col>
                  </b-row>
                  <br>
                  <b-row>
                    <b-col>
                      <b-img v-if="profilePictureForm.imageFileUrl" :src="profilePictureForm.imageFileUrl" fluid
                             class="avatarBig"></b-img>
                      <b v-else>No profile picture</b>
                    </b-col>
                  </b-row>
                  <br>
                  <b-row>
                    <b-col>
                      <b-button type="submit">Save changes</b-button>
                    </b-col>
                  </b-row>
                  <br>
                  <b-row>
                    <b-col>
                      <b-alert v-model="profilePictureForm.successAlert" variant="success" dismissible>
                        Save success
                      </b-alert>
                      <b-alert v-model="profilePictureForm.failAlert" variant="danger" dismissible>
                        Save failed
                      </b-alert>
                    </b-col>
                  </b-row>

                </b-form>
              </b-tab>
              <b-tab title="Profile info">
                <b-form novalidate @submit.stop.prevent="changeProfileInfo">
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>Name</label>
                        <b-form-input
                          required
                          v-model="$v.profileInfoForm.name.$model"
                          :state="validateProfileInfoState('name')"
                          v-on:input="resetProfileInfoFormAlert"
                        >
                        </b-form-input>
                        <b-form-invalid-feedback>
                          {{profileInfoForm.nameErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>City</label>
                        <b-form-input
                          :state="validateProfileInfoState('city')"
                          v-model="$v.profileInfoForm.city.$model"
                          v-on:input="resetProfileInfoFormAlert"
                        >
                        </b-form-input>
                        <b-form-invalid-feedback>
                          {{profileInfoForm.cityErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>Country</label>
                        <b-form-input
                          :state="validateProfileInfoState('country')"
                          v-model="$v.profileInfoForm.country.$model"
                          v-on:input="resetProfileInfoFormAlert"
                        ></b-form-input>
                        <b-form-invalid-feedback>
                          {{profileInfoForm.countryErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-button type="submit">Save</b-button>
                    </b-col>
                  </b-row>

                  <br>
                  <b-row>
                    <b-col>
                      <b-alert v-model="profileInfoForm.successAlert" variant="success" dismissible>
                        Save success
                      </b-alert>
                      <b-alert v-model="profileInfoForm.failAlert" variant="danger" dismissible>
                        {{profileInfoForm.failAlertMsg}}
                      </b-alert>
                    </b-col>
                  </b-row>

                </b-form>
              </b-tab>

              <b-tab title="Email address">
                <b-form novalidate @submit.stop.prevent="changeEmailAddress">
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>Email Address</label>
                        <b-form-input
                          v-model="$v.emailAddressForm.email.$model"
                          :state="validateEmailState('email')"
                          v-on:input="resetEmailAddressFormAlert"
                        ></b-form-input>
                        <b-form-invalid-feedback>
                          {{emailAddressForm.emailErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-button type="submit">Save</b-button>
                    </b-col>
                  </b-row>

                  <br>

                  <b-row>
                    <b-col>
                      <b-alert v-model="emailAddressForm.successAlert" variant="success" dismissible>
                        Save success
                      </b-alert>
                      <b-alert v-model="emailAddressForm.failAlert" variant="danger" dismissible>
                        {{emailAddressForm.failAlertMsg}}
                      </b-alert>
                    </b-col>
                  </b-row>
                </b-form>
              </b-tab>

              <b-tab title="Password">
                <b-form novalidate @submit.stop.prevent="changePassword">
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>Current Password</label>
                        <b-form-input
                        v-model="$v.passwordForm.currentPassword.$model"
                        :state="validatePasswordState('currentPassword')"
                        type="password"
                        v-on:input="resetPasswordFormAlert"
                        ></b-form-input>
                        <b-form-invalid-feedback>
                          {{passwordForm.currentPasswordErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-form-group>
                        <label>New Password</label>
                        <b-form-input
                        v-model="$v.passwordForm.newPassword.$model"
                        :state="validatePasswordState('newPassword')"
                        type="password"
                        v-on:input="resetPasswordFormAlert"
                        ></b-form-input>
                        <b-form-invalid-feedback>
                          {{passwordForm.newPasswordErrorMsg}}
                        </b-form-invalid-feedback>
                      </b-form-group>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <b-button type="submit">Save</b-button>
                    </b-col>
                  </b-row>

                  <br>

                  <b-row>
                    <b-col>
                      <b-alert v-model="passwordForm.successAlert" variant="success" dismissible>
                        Save success
                      </b-alert>
                      <b-alert v-model="passwordForm.failAlert" variant="danger" dismissible>
                        {{passwordForm.failAlertMsg}}
                      </b-alert>
                    </b-col>
                  </b-row>

                </b-form>
              </b-tab>

            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
  <div v-else-if ="$cookies.isKey('authToken') && $cookies.get('userId') != $route.params.userId" >
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-alert show variant="danger" style="text-align: center">You can only edit your own profile</b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
  <div v-else>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-alert show style="text-align: center">You must be logged in to edit your profile</b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import {required, email, minLength} from "vuelidate/lib/validators";

  export default {
    name: "Register",
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        profilePictureForm: {
          imageFile: null,
          imageFileUrl: null,
          successAlert: false,
          failAlert: false,
          failAlertMsg: "",
        },
        profileInfoForm: {
          name: "",
          city: "",
          country: "",
          successAlert: false,
          failAlert: false,
          failAlertMsg: "",
          nameErrorMsg: "The name must be at least length 1",
          cityErrorMsg: "The city must be at least length 1",
          countryErrorMsg: "The country must be at least length 1"
        },
        emailAddressForm: {
          email: "",
          successAlert: false,
          failAlert: false,
          failAlertMsg: "",
          emailErrorMsg: "This must be an valid email"
        },
        passwordForm: {
          currentPassword: "",
          newPassword: "",
          successAlert: false,
          failAlert: false,
          failAlertMsg: "",
          currentPasswordErrorMsg: "This field is required",
          newPasswordErrorMsg: "This field is required",
        }
      }
    },
    validations: {
      profileInfoForm: {
        name: {
          required,
          minLength: minLength(1)
        },
        city: {
          minLength: minLength(1)
        },
        country: {
          minLength: minLength(1)
        }
      },
      emailAddressForm: {
        email: {
          required,
          email
        }
      },
      passwordForm: {
        currentPassword: {
          required,
          minLength: minLength(1)
        },
        newPassword: {
          required,
          minLength: minLength(1)
        }
      }
    },

    methods: {
      validateProfileInfoState: function (name) {
        const {$dirty, $error} = this.$v.profileInfoForm[name];
        return ($dirty && $error) ? false : null;
      },
      validateEmailState: function (name) {
        const {$dirty, $error} = this.$v.emailAddressForm[name];
        return ($dirty && $error) ? false : null;
      },
      validatePasswordState: function (name) {
        const {$dirty, $error} = this.$v.passwordForm[name];
        return ($dirty && $error) ? false : null;
      },
      changeProfilePicture: function () {
        if (this.profilePictureForm.imageFile != null) {
          this.putUserPhoto();
        } else {
          this.deleteUserPhoto();
        }
      },
      changeProfileInfo: function () {
        this.$v.profileInfoForm.$touch();
        if (this.$v.profileInfoForm.$anyError) {
          return;
        }
        let data = {
          name: this.profileInfoForm.name
        };
        if (this.profileInfoForm.city) {
          data.city = this.profileInfoForm.city;
        }
        if (this.profileInfoForm.country) {
          data.country = this.profileInfoForm.country;
        }
        this.patchUser(data)
          .then((response) => {
            this.profileInfoForm.successAlert = true;
            this.profileInfoForm.failAlert = false;
          })
          .catch((error) => {
            this.profileInfoForm.successAlert = false;
            this.profileInfoForm.failAlert = true;
            if (error.response.status == 500) {
              this.profileInfoForm.failAlertMsg = "Failed to save, server error"
            } else if (error.response.status == 400) {
              this.profileInfoForm.failAlertMsg = error.response.statusText
            }
          });
      },
      changeEmailAddress: function () {
        this.$v.emailAddressForm.$touch();
        if (this.$v.emailAddressForm.$anyError) {
          return;
        }
        let data = {
          email: this.emailAddressForm.email
        };
        this.patchUser(data)
          .then((response) => {
            this.emailAddressForm.successAlert = true;
            this.emailAddressForm.failAlert = false;
          })
          .catch((error) => {
            this.emailAddressForm.successAlert = false;
            this.emailAddressForm.failAlert = true;
            if (error.response.status == 400) {
              this.emailAddressForm.failAlertMsg = error.response.statusText;
            } else if (error.response.status == 500) {
              this.emailAddressForm.failAlertMsg = "Failed to save, server error"
            }
          });
      },
      changePassword: function () {
        this.$v.passwordForm.$touch();
        if (this.$v.passwordForm.$anyError) {
          return;
        }
        let data = {
          currentPassword: this.passwordForm.currentPassword,
          password: this.passwordForm.newPassword
        }
        this.patchUser(data)
          .then((response) => {
            this.passwordForm.successAlert = true;
            this.passwordForm.failAlert = false;
          })
          .catch((error) => {
            this.passwordForm.successAlert = false;
            this.passwordForm.failAlert = true;
            if (error.response.status == 400) {
              this.passwordForm.failAlertMsg = "Current password provided is incorrect"
            } else if (error.response.status == 500) {
              this.passwordForm.failAlertMsg = "Failed to save, server error"
            }
          });
      },
      putUserPhoto: function () {
        let headers = {
          'Content-Type': this.profilePictureForm.imageFile.type,
          "X-Authorization": this.$cookies.get("authToken")
        }

        this.$http.put(this.serverUrl + "/users/" + this.$cookies.get("userId") + "/photo", this.profilePictureForm.imageFile, {
          headers: headers
        })
          .then((response) => {
            this.profilePictureForm.successAlert = true;
            this.profilePictureForm.failAlert = false;
          })
          .catch((error) => {
            this.profilePictureForm.successAlert = false
            this.profilePictureForm.failAlert = true;
          })
      },
      getUserPhoto() {
        this.$http.get(this.serverUrl + "/users/" + this.$cookies.get("userId") + "/photo", {responseType: 'blob'})
          .then((response) => {
            let image = response.data;
            this.profilePictureForm.imageFile = new File([image], "current_image", {type: image.type});
            this.getImageUrl(this.profilePictureForm.imageFile);
          })
          .catch((error) => {

          })
      },
      deleteUserPhoto() {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }

        this.$http.delete(this.serverUrl + "/users/" + this.$cookies.get("userId") + "/photo", {headers: headers})
          .then((response) => {
            this.profilePictureForm.successAlert = true;
            this.profilePictureForm.failAlert = false;
          })
          .catch((error) => {
            if (error.response.status == 404) {
              this.profilePictureForm.successAlert = true;
              this.profilePictureForm.failAlert = false;
            } else {
              this.profilePictureForm.successAlert = false
              this.profilePictureForm.failAlert = true;
            }
          })

      },
      removeProfilePicture() {
        this.profilePictureForm.imageFile = null;
        this.profilePictureForm.imageFileUrl = null;
      },
      resetAllAlerts() {
        this.resetProfilePictureFormAlert();
        this.resetPasswordFormAlert();
        this.resetProfileInfoFormAlert();
        this.resetEmailAddressFormAlert();
      },
      resetProfilePictureFormAlert() {
        this.profilePictureForm.successAlert = false;
        this.profilePictureForm.failAlert = false;
      },
      resetProfileInfoFormAlert() {
        this.profileInfoForm.successAlert = false;
        this.profileInfoForm.failAlert = false;
      },
      resetEmailAddressFormAlert() {
        this.emailAddressForm.successAlert = false;
        this.emailAddressForm.failAlert = false;
      },
      resetPasswordFormAlert() {
        this.passwordForm.successAlert = false;
        this.passwordForm.failAlert = false;
      },
      getImageUrl(imageFile) {
        if (imageFile) {

          let fr = new FileReader();
          let vueObj = this;
          fr.addEventListener("load", function () {
            vueObj.profilePictureForm.imageFileUrl = fr.result;
          }, false);
          fr.readAsDataURL(imageFile);
        } else {
          this.profilePictureForm.imageFileUrl = null;
        }
      },
      getUser() {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        this.$http.get(this.serverUrl + "/users/" + this.$cookies.get("userId"), {headers: headers})
          .then((response) => {
            this.profileInfoForm.name = response.data.name;
            this.profileInfoForm.city = response.data.city;
            this.profileInfoForm.country = response.data.country;
            this.emailAddressForm.email = response.data.email;
          })
          .catch((error) => {
            console.log(error);
          })
      },
      patchUser(data) {
        let headers = {
          "X-Authorization": this.$cookies.get("authToken")
        }
        return this.$http.patch(this.serverUrl + "/users/" + this.$cookies.get("userId"), data, {headers: headers})
      },
      updateData() {
        this.getUserPhoto();
        this.getUser();
        this.resetAllAlerts();
      }

    },
    mounted() {
      this.getUserPhoto();
      this.getUser();
    }
  }
</script>

<style scoped>
</style>
