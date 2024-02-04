const boardContainer = document.getElementById("adventure-board");
const scenarioScene = document.getElementById("scene");
const currentRole = document.getElementById("role");
const scenarioImage = document.getElementById("scene-image");
const scenarioText = document.getElementById("scenario-text");
const optionButtonContainer = document.getElementById("board-options");

let state = { role: null, items: [], status: "alive" };

runScenarios();

async function runScenarios(id) {
  try {
    const storyData = await fetchData();
    const scenarios = storyData.scenarios;
    showScenario(scenarios[id ? id - 1 : 0]); //success, run the scenario
  } catch (error) {
    console.error("Error: ", error);
    showError(); //failed, hide scenario & show error message
  }
}

function pickOption(option) {
  if (option.requires != null) {
    let hasItem = false;
    //check if the required item is in the state
    state.items.forEach((item) => {
      if (option.requires.includes(item.name)) {
        hasItem = true;
      } else {
        hasItem = false;
      }
    });

    return hasItem;
  } else {
    return true;
  }
}

function showScenario(scenario) {
  // Setting inner text/values for elements to display the scenario
  scenarioScene.innerText = scenario.scene;
  scenarioImage.style.backgroundImage = `url('${scenario.sceneImage}')`;
  scenarioText.innerText = scenario.scenarioText;
  if (state.status === "alive") {
    currentRole.innerText = state.role ? `Role: ${state.role}` : "Lost";
  } else {
    currentRole.innerHTML = `Fail`;
  }
  scenario.options.forEach((option) => {
    let buttonClasses = "";

    if (option.end && state.status === "dead") {
      buttonClasses = "fail";
    } else if (option.end && state.status !== "dead") {
      buttonClasses = "success";
    }

    if (pickOption(option)) {
      const button = document.createElement("button");
      button.innerText = option.optionText;
      button.classList.add("option");
      buttonClasses ? button.classList.add(buttonClasses) : null;
      button.addEventListener("click", () => selectOption(option));
      optionButtonContainer.appendChild(button);
    }
  });
}

function selectOption(option) {
  // Set role
  if (option.newRole) {
    state.role = option.newRole;
    console.log(state);
  }
  // Set items array
  if (option.pickupItem) {
    state.items.push(option.pickupItem);
  }

  while (optionButtonContainer.firstChild) {
    optionButtonContainer.removeChild(optionButtonContainer.firstChild);
  }

  if (option.newRole === "Dead") {
    state.status = "dead";
  }

  if (option.end) {
    state.status = "alive";
    state.role = null;
    state.items = [];
  }

  runScenarios(option.nextScenario);
}

async function fetchData() {
  try {
    const response = await fetch("story.json");
    if (!response.ok) {
      throw new Error("It seems there was an error. So sad.");
    }
    return response.json();
  } catch (error) {
    console.error("Error: ", error);
  }
}

function showError() {
  // Get rid of all the empty elements on the board since the fetch has failed and they will not be filled
  while (boardContainer.firstChild) {
    boardContainer.removeChild(boardContainer.firstChild);
  }

  // Add in an error element
  const errorMessage = document.createElement("p");
  errorMessage.innerText = "An error has occured. Please refresh the page.";
  errorMessage.style.textAlign = "center";

  boardContainer.appendChild(errorMessage);
}
