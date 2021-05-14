'use strict'
class Task {
  constructor(title, description, difficulty, instruction, moreInfo) {
    this.title = title;
    this.description = description;
    this.difficulty = difficulty;
    this.instruction = instruction;
    this.moreInfo = moreInfo;
  }

  getTitle() {
    return this.title;
  }

  getDifficulty() {
    return this.difficulty;
  }

  getDifficultyStars (maxDifficulty) {
    const rating = this.difficulty;
    const fullStar = ' <i class="fas fa-star"></i>'.repeat(Math.ceil(rating));
    const noStar = ' <i class="far fa-star"></i>'.repeat(Math.floor(maxDifficulty-rating));
    return `${fullStar}${noStar}`;
}

  getDescription() {
    return this.description;
  }
}

// Firestore data converter
var taskConverter = {
  toFirestore: function(task) {
      return {
          title: task.title,
          description: task.description,
          difficulty: task.difficulty,
          instruction: task.instruction,
          moreInfo: task.moreInfo
      };
  },
  fromFirestore: function(snapshot, options){
      const data = snapshot.data(options);
      return new Task(data.title, data.description, data.difficulty, data.instruction, data.moreInfo);
  }
};



//This is to create database.
//You can add/edit here and it will be shown on firestore realtime.
const taskRef = db.collection("Tasks");

//Creating task objects.
const recycling = new Task("recycle", "Throw recyclable bottle in the recycle bin", "2", "https://www.youtube.com/embed/6jQ7y_qQYUA", "https://www.youtube.com/embed/7UuUeoyYmxI");
const walking = new Task("walking", "Try walking or biking to places!", "2", "https://www.youtube.com/embed/BWR3DxGHLD4","for more info");
const plant_a_seed = new Task("Plant a seed", "Try a seed to grow something!", "3", "https://www.youtube.com/embed/BWR3DxGHLD4", "for more info");
const plant_a_tree = new Task("Plant a Tree", "Try planting a tree!", "3", "https://www.youtube.com/embed/N7fIqlLB1eU", "more info");
const turn_off_light = new Task("Turn off Light", "When you leave your room, turn off the light!", "2", "https://www.youtube.com/embed/DfrHBy6YPj0", "for more info");
const turn_off = new Task("Turn off!", "Turn off when you are done using it!", "2", "https://www.youtube.com/embed/6xJU5jZgnJI", "more info");
const buy_local_products = new Task("Buy Things Local", "Reduce product transportation carbon emission by purchasing locally grown or manufactured products.", "3", "Instruction", "For more info");
const public_transportation = new Task("Try bus! (Public transportation)", "Try taking a public transit (bus, skytrain)!", "3", "instruction", "reducing carbon emission");
const conserve_water = new Task("Just a little water!", "Try to use less water for a day!", "2", "Tell mommy to use less water!", "More fresh water!");
const change_light_bulbs = new Task("Change lightbulbs!", "Let's change your light bulbs to LED!", "3", "We need our parents help! Lets go buy the light bulb together", "more info");


//sending to firestore to save under each document.
taskRef.doc("recycling").withConverter(taskConverter).set(recycling);
taskRef.doc("walking").withConverter(taskConverter).set(walking);
taskRef.doc("plant_a_seed").withConverter(taskConverter).set(plant_a_seed);
taskRef.doc("plant_a_tree").withConverter(taskConverter).set(plant_a_tree);
taskRef.doc("turn_off_light").withConverter(taskConverter).set(turn_off_light);
taskRef.doc("turn_off").withConverter(taskConverter).set(turn_off);
taskRef.doc("buy_local_products").withConverter(taskConverter).set(buy_local_products);
taskRef.doc("public_transportation").withConverter(taskConverter).set(public_transportation);
taskRef.doc("conserve_water").withConverter(taskConverter).set(conserve_water);
taskRef.doc("change_light_bulbs").withConverter(taskConverter).set(change_light_bulbs);

console.log("adding successfull");
