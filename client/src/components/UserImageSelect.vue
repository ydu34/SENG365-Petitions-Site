<template>
  <div>
    <b-row>
      <b-col>
        <b-form-file
          accept="image/jpeg, image/png, image/gif"
          v-model="profilePictureForm.imageFile"
          placeholder="Choose a image or drop it here..."
          drop-placeholder="Drop file here..."
          v-on:input="getImageUrl(profilePictureForm.imageFile)"
          class="fileinput-filename"
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
  </div>
</template>

<script>
  export default {
    name: "UserImageSelect.vue",
    props: {},
    data() {
      return {
        profilePictureForm: {
          imageFile: null,
          imageFileUrl: null,
          successAlert: false,
          failAlert: false,
          failAlertMsg: "",
        },
      }
    },
    methods: {
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
        this.emitToParent();
      },
      removeProfilePicture() {
        this.profilePictureForm.imageFile = null;
        this.profilePictureForm.imageFileUrl = null;
      },
      emitToParent() {
        this.$emit('childToParent', this.profilePictureForm.imageFile);
      }
    }
  }
</script>

<style scoped>

</style>
