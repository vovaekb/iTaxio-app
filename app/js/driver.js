function Driver(initObj) {
    this.id = "";
    this.rating = null;
    this.firstname = "";
    this.lastname = "";
    this.carmark = "";
    this.carmodel = "";
    this.caryear = null;
    this.carno = "";
    this.carcolor = "";

    this.getFullName = function() {
        return this.lastname + " " + this.firstname;
    }

    for(var key in initObj) {
        if(typeof this[key] !== undefined) {
            this[key] = initObj[key];
        }
    }
    return this;
}