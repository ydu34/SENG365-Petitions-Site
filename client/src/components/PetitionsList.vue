<template>
  <div>
    <div v-for="petition in petitions">
      <b-row class="justify-content-md-center">
        <b-col cols="9">
          <b-card
            :footer="'Signed by ' + petition.signatureCount + ' people'"
            footer-tag="footer"
            no-body class="overflow-hidden clickable"
            v-on:click="$router.push('/petitions/'+petition.petitionId)">
            <b-row no-gutters>
              <b-col md="4">
                <b-card-img
                  v-bind:src='"http://localhost:4941/api/v1/petitions/"+petition.petitionId+"/photo"'
                  class="rounded-0">

                </b-card-img>
              </b-col>
              <b-col style="margin-left:10px; margin-top:5px">
                <b-card-title>{{petition.title}}</b-card-title>
                <b-card-text>
                  <h6>{{ petition.category }}</h6>
                  <h6>Author: {{ petition.authorName}} </h6>
                  <h6 style="color:blue">Click to learn more</h6>
                </b-card-text>
              </b-col>

            </b-row>
          </b-card>

        </b-col>
      </b-row>
      <br>
    </div>
  </div>
</template>

<script>
  export default {
    name: "PetitionsList.vue",
    props: {
      petitions: Array
    }
  }
</script>

<style scoped>

</style>
