class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); 
        this.engine.addChoice("Start");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); 
    }
}

class Location extends Scene {
    create(key) {
        this.currentLocation = key; // Store the current location
        let locationData = this.engine.storyData.Locations[key]; 
        let description = locationData.Body;
        
        // Customize description based on state
        if (key === "Blood Stream") {
            description += this.engine.hasOxygen ? locationData.Carrying : locationData.None;
        }
        
        this.engine.show(description); 
        
        // Check win condition
        if (this.engine.checkWinCondition()) {
            this.engine.show("<h2>Congratulations! You've oxygenated all organs!</h2>");
            this.engine.addChoice("Play again", { restart: true });
            return;
        }
        
        if(locationData.Choices) { 
            for(let choice of locationData.Choices) { 
                this.engine.addChoice(choice.Text, choice); 
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if (choice && choice.restart) {
            // Reset game state and restart
            this.engine.hasOxygen = false;
            for (let organ in this.engine.organsOxygenated) {
                this.engine.organsOxygenated[organ] = false;
            }
            this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
            return;
        }
        
        if(choice) {
            this.engine.show("> "+choice.Text);
            
            //Check if trying to enter organ without oxygen
            const isOrgan = ["Brain", "Liver", "Gut", "Rest of Body"].includes(choice.Target);
            if (isOrgan && !this.engine.hasOxygen) {
                this.engine.show(`<br><span style="color: red;">You can't deliver oxygen to the ${choice.Target} because you're not carrying any! Visit the lungs first.</span>`);
                //recreate the current scene to show options again
                this.create(this.currentLocation);
                return;
            }
            
            // handle oxygen pickup in lungs
            if (choice.Target === "Lungs") {
                this.engine.hasOxygen = true;
                this.engine.show("<br>You've picked up oxygen in the lungs!");
            }
            
            //Handle oxygen delivery to organs
            if (this.engine.hasOxygen && isOrgan) {
                if (!this.engine.organsOxygenated[choice.Target]) {
                    this.engine.organsOxygenated[choice.Target] = true;
                    this.engine.hasOxygen = false;
                    this.engine.show(`<br>You've successfully delivered oxygen to the ${choice.Target}!`);
                } else {
                    this.engine.show(`<br>The ${choice.Target} already has enough oxygen. Find another organ that needs it!`);
                    // keep the oxygen since we didn't deliver it
                }
            }
            
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class LiverMechanism extends Location {
    create() {
        const liverData = this.engine.storyData.Locations.Liver;
        
        // show base description
        this.engine.show(liverData.Body);
        
        // handle oxygen delivery message
        if (this.engine.justDeliveredOxygen) {
            this.engine.show("<p class='oxygen-delivery'>Oxygen delivered successfully!</p>");
            this.engine.justDeliveredOxygen = false;
        }
        
        // add all choices
        liverData.Choices.forEach(choice => {
            if (choice.Action === "prod") {
                this.engine.addChoice(choice.Text, choice);
            } else {
                this.engine.addChoice(choice.Text, choice);
            }
        });
    }

    handleChoice(choice) {
        if (choice?.Action === "prod") {
            // random liver event
            const events = this.engine.storyData.Locations.Liver.Mechanism.PossibleEvents;
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            this.engine.show(`<p class="liver-event">${randomEvent}</p>`);
            this.create(); // Refresh to show choices again
        } 
        else {
            // handle oxygen delivery
            if (choice?.Target === "Liver" && this.engine.hasOxygen) {
                this.engine.justDeliveredOxygen = true;
                this.engine.organsOxygenated.Liver = true;
                this.engine.hasOxygen = false;
            }
            super.handleChoice(choice);
        }
    }
}

Engine.load(Start, 'myStory.json');