<template>
  <div>
    <div v-if="errorFlag" style="color: red;">
      {{ error }}
    </div>
    <b-container>

      <div id="petitions">
        <b-row class="justify-content-md-center">
          <b-col cols="9">
            <b-card>
              <b-form-group>
                <b-row>
                  <b-col>
                    <label>Search </label>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-input v-model="search.phrase"></b-input>
                  </b-col>
                  <b-col  cols="auto">
                    <b-button @click="getPetitions()">Search</b-button>
                  </b-col>
                </b-row>
              </b-form-group>
              <b-row>

              </b-row>
              <b-form-group>
                <b-row>
                  <b-col>
                    <label>Filter by category </label>
                    <b-form-select v-model="search.selectedCategory" :options="search.categoryOptions" v-on:change="getPetitions()"></b-form-select>
                  </b-col>
                </b-row>
              </b-form-group>
              <b-form-group>
                <b-row>
                  <b-col>
                    <label>Sort by </label>
                    <b-form-select v-model="search.selectedSort" :options="search.sortOptions" v-on:change="getPetitions()"></b-form-select>
                  </b-col>
                </b-row>
              </b-form-group>



            </b-card>
            <hr>
          </b-col>
        </b-row>

        <PetitionsList v-bind:petitions="currentPagePetitions">

        </PetitionsList>

        <div v-if="petitions.length==0">
          <b-row class="justify-content-md-center">
            <b-col style="text-align: center">
              <h6>No results</h6>
            </b-col>

          </b-row>
        </div>
        <b-row class="justify-content-md-center">
          <b-col cols="9">
            <hr>
          </b-col>
        </b-row>

        <b-row class="justify-content-md-center">
          <b-col cols="9">
            <template>
              <div class="overflow-auto">
                <b-pagination-nav
                  align="center"
                  first-text="First"
                  prev-text="Prev"
                  next-text="Next"
                  last-text="Last"
                  :link-gen="linkGen"
                  :number-of-pages="numberOfPages"
                  use-router></b-pagination-nav>
              </div>
            </template>

          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>


</template>

<script>
  import PetitionsList from '../components/PetitionsList.vue';

  export default {
    name: "Petitions",
    components: {
      PetitionsList
    },
    data() {
      return {
        serverUrl: "http://localhost:4941/api/v1",
        error: "",
        errorFlag: false,
        petitions: [],
        currentPagePetitions: [],
        search: {
          phrase: "",
          categoryOptions: [
            {value: null, text: "All Categories"}
          ],
          selectedCategory: null,
          sortOptions: [
            {value: "SIGNATURES_DESC", text: "Default: the number of signatures, from most to least"},
            {value: "SIGNATURES_ASC", text: "The number of signatures, from least to most"},
            {value: "ALPHABETICAL_ASC", text: "Alphabetically by title, A - Z"},
            {value: "ALPHABETICAL_DESC", text: "Alphabetically by title, Z - A"},


          ],
          selectedSort: "SIGNATURES_DESC",
        },
        page: {
          itemLimit: 10,
        }
      }
    },
    computed: {
      numberOfPages: function () {
        if (this.petitions.length > 0) {
          return Math.ceil(this.petitions.length / this.page.itemLimit)
        } else {
          return 1;
        }
      }
    },
    mounted: function () {
      this.getPetitions();
      this.getPetitionsCategories();
    },
    methods: {
      linkGen(pageNum) {
        return pageNum === 1 ? '?' : `?page=${pageNum}`
      },
      getPetitions: function () {
        let params = {};

        if (this.search.phrase.trim()) {
          params.q = this.search.phrase.trim();
        }

        if (this.search.selectedCategory) {
          params.categoryId = this.search.selectedCategory;
        }

        if (this.search.selectedSort) {
          params.sortBy = this.search.selectedSort;
        }

        this.$http.get(this.serverUrl + "/petitions", {params: params})
          .then((response) => {
            this.petitions = response.data;
            this.changePage();
            if (this.$route.query.page) {
              this.$router.push("/petitions");
            }
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      getPetitionsCategories: function () {
        this.$http.get(this.serverUrl + "/petitions/categories")
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              this.search.categoryOptions.push({
                value: response.data[i].categoryId,
                text: response.data[i].name
              })
            }
          })
          .catch((error) => {
            console.log(error);
          })
      },
      changePage: function () {
        this.currentPagePetitions = [];
        for (let i = 0; i < 10; i++) {
          let itemNumber = i;
          if (this.$route.query.page) {
            itemNumber = (this.$route.query.page - 1) * 10 + i;
          }
          if (itemNumber < this.petitions.length) {
            this.currentPagePetitions.push(this.petitions[itemNumber]);
          }
        }
      }
    },
    watch: {
      $route(to, from) {
        this.changePage();
      }
    }
  }
</script>

<style scoped>

</style>
