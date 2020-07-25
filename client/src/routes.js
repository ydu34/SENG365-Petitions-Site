import Home from "./views/Home";
import Petitions from "./views/Petitions";
import Petition from "./views/Petition";
import Register from "./views/Register";
import Login from "./views/Login";
import PetitionCreate from "./views/PetitionCreate";
import ProfileEdit from "./views/ProfileEdit";
import PetitionEdit from "./views/PetitionEdit";

const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/petitions/create",
    name: "petitionCreate",
    component: PetitionCreate
  },
  {
    path: "/petitions/:petitionId/edit",
    name: "petitionEdit",
    component: PetitionEdit
  },
  {
    path: "/petitions/:petitionId",
    name: "petition",
    component: Petition
  },
  {
    path: "/petitions",
    name: "petitions",
    component: Petitions
  },
  {
    path: "/users/register",
    name: "register",
    component: Register
  },
  {
    path: "/users/login",
    name: "login",
    component: Login
  },
  {
    path: "/users/:userId/edit",
    name: "profileEdit",
    component: ProfileEdit
  },
  {
    path: "*",
    component: Home
  }
];

export default routes;
