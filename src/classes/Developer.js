class Developer{

    constructor(firstName, lastName){
        this.firstName = firstName;
        this.lastName = lastName;
    }

    getname(){
        return this.firstName + ' ' + this.lastName;
    }
}


const jakov = new Developer('Jakov', 'Kristovic');

console.log(jakov.getname());
// "Jakov Kristovic"

const bob = new Developer('Bob', 'Tabor');

console.log(bob.getname());
// "Bob Tabor"