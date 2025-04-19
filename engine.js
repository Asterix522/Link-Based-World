class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;
        
        //Game state
        this.justDeliveredOxygen = false;
        this.hasOxygen = false;
        this.organsOxygenated = {
            Brain: false,
            Liver: false,
            Gut: false,
            "Rest of Body": false
        };

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass)
            }
        );
    }

    gotoScene(sceneClass, data) {
        if (data === "Liver") {
            sceneClass = LiverMechanism;
        }
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while(this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild)
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }

    checkWinCondition() {
        //Check if all organs have been oxygenated
        for (let organ in this.organsOxygenated) {
            if (!this.organsOxygenated[organ]) return false;
        }
        return true;
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}