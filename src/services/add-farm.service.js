import axios from "axios";

export class AddFarmService {
  addFarm(farm) {
    if (farm.name && farm.chainName && farm.masterChef && farm.website) {
      var config = {
        method: "post",
        url: "https://shieldapi.miim.club/addFarm?apiKey=9SAJkabDq5VzSRre",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(farm),
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
}

export default new AddFarmService();
