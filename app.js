class Pallet {
  constructor(id, weight) {
    this.weight = weight;
    this.id = id;
  }
}

const maxPalletCount = 5;
const maxPalletWeight = 1000;
//var operator = "add";

// function closure
var totalPallets = (() => {
  var palletCounter = 0;
  return operator => {
    operator === "add" ? (palletCounter += 1) : (palletCounter -= 1);
    return palletCounter;
  };
})();

// UI Class to display/add/remove
class UITruck {
  static displayPallets() {
    const pallets = Store.getPallets();

    pallets.forEach(pallet => UITruck.addPalletToList(pallet));
  }

  // Add Pallet to list
  static addPalletToList(pallet) {
    const list = document.querySelector("#pallet-list");
    const row = document.createElement("tr");
    //operator = "add";
    let palletCount = totalPallets("add");
    let palletWeight = UITruck.totalPalletWeight(pallet.weight, "add");

    row.classList.add("pallet-row");
    row.dataset.id = pallet.id;
    row.innerHTML = `
        <td>${pallet.id}</td>
        <td>${pallet.weight}</td>
        <td><a href="#" class="btn btn-danger btn-sm delete" data-id="${pallet.id}">X</a></td>
        `;

    list.appendChild(row);

    // Update pallet count
    //document.querySelector("#pallet-count").innerHTML = `Pallet Count: ${palletCount}`;
    document
      .getElementById("pallet-count")
      .getElementsByTagName("span")[0].innerHTML = palletCount;

    // Update pallet weight
    document
      .getElementById("pallet-weight")
      .getElementsByTagName("span")[0].innerHTML = palletWeight;
  }

  // remove Pallet from list
  static deletePallet(elem) {
    if (elem.classList.contains("delete")) {
      //console.log('Id: ' + elem.parentElement.previousElementSibling.previousElementSibling.textContent);
      //elem.parentElement.parentElement.remove();
      const id = elem.dataset.id;
      let currentElemWeight =
        elem.parentElement.previousElementSibling.textContent;

      document.querySelector(`.pallet-row[data-id="${id}"]`).remove();
      //operator = "subtract";
      let palletCount = totalPallets("subtract");

      let palletWeight = UITruck.totalPalletWeight(
        currentElemWeight,
        "subtract"
      );

      // Update pallet count
      document
        .getElementById("pallet-count")
        .getElementsByTagName("span")[0].innerHTML = palletCount;

      // Update pallet Weight
      document
        .getElementById("pallet-weight")
        .getElementsByTagName("span")[0].innerHTML = palletWeight;

      // remove from Store
      //Store.removePallet(elem.parentElement.previousElementSibling.previousElementSibling.textContent);
      Store.removePallet(id);

      // Show success message
      UITruck.showAlert("Pallet Removed", "success");
    }
  }

  static totalPalletWeight(weight, operator) {
    return operator === "add"
      ? Number(
          document
            .getElementById("pallet-weight")
            .getElementsByTagName("span")[0].innerHTML
        ) + Number(weight)
      : Number(
          document
            .getElementById("pallet-weight")
            .getElementsByTagName("span")[0].innerHTML
        ) - Number(weight);
  }

  static showAlert(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const form = document.querySelector("#pallet-form");
    container.insertBefore(div, form);
    // Clear Alert in 3 seconds
    setTimeout(() => document.querySelector(".alert").remove(), 3000);
  }

  static validateUI(id, weight) {
    let isUIValid = true;
    const pallets = Store.getPallets();
    const currentPalletCount = Number(
      document.getElementById("pallet-count").getElementsByTagName("span")[0]
        .innerHTML
    );
    const currentPalletWeight =
      Number(
        document.getElementById("pallet-weight").getElementsByTagName("span")[0]
          .innerHTML
      ) + Number(weight);
    if (id === "" || weight === "") {
      isUIValid = false;
      UITruck.showAlert("Please fill in all the fields", "danger");
    } else if (UITruck.checkDuplicateId(pallets, id)) {
      isUIValid = false;
      UITruck.showAlert("Please enter unique id", "danger");
    } else if (currentPalletCount >= maxPalletCount) {
      isUIValid = false;
      UITruck.showAlert(
        `Pallet count cannot exceed ${maxPalletCount}`,
        "danger"
      );
    } else if (currentPalletWeight >= maxPalletWeight) {
      isUIValid = false;
      UITruck.showAlert(
        `Pallet weight cannot exceed ${maxPalletWeight}`,
        "danger"
      );
    }
    return isUIValid;
  }

  static checkDuplicateId(pallets, currId) {
    let idExists = false;

    pallets.forEach((pallet, index) => {
      if (pallet.id === currId) {
        idExists = true;
      }
    });
    return idExists;
  }

  static clearFields() {
    document.querySelector("#id").value = "";
    document.querySelector("#weight").value = "";
  }
}

class Store {
  static getPallets() {
    let pallets;
    if (localStorage.getItem("pallets") === null) {
      pallets = [];
    } else {
      pallets = JSON.parse(localStorage.getItem("pallets"));
    }
    return pallets;
  }

  static addPallet(pallet) {
    const pallets = Store.getPallets();
    pallets.push(pallet);
    localStorage.setItem("pallets", JSON.stringify(pallets));
  }

  static removePallet(id) {
    const pallets = Store.getPallets();

    pallets.forEach((pallet, index) => {
      //console.log(`pallet id: ${pallet.id}`);
      if (pallet.id === id) {
        pallets.splice(index, 1);
      }
    });

    localStorage.setItem("pallets", JSON.stringify(pallets));
  }
}

// Event: Display Pallets
document.addEventListener("DOMContentLoaded", UITruck.displayPallets);

// Event: Add a Pallet
document.querySelector("#pallet-form").addEventListener("submit", e => {
  e.preventDefault();
  // Get form values
  const id = document.querySelector("#id").value;
  const weight = document.querySelector("#weight").value;

  // if data valid
  if (UITruck.validateUI(id, weight)) {
    // instantiate a pallet
    const pallet = new Pallet(id, weight);

    // add pallet to ui list
    UITruck.addPalletToList(pallet);

    // add pallet to store
    Store.addPallet(pallet);

    // Show success message
    UITruck.showAlert("Pallet Added", "success");

    // Clear Fields
    UITruck.clearFields();
  }
});

// Event: Delete a pallet
document.querySelector("#pallet-list").addEventListener("click", e => {
  //remove pallet from ui
  UITruck.deletePallet(e.target);
});
