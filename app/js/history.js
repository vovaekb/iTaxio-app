function HistoryItem(initObj) {
    this.cityName = ko.observable();
    this.streetId = ko.observable();
    this.houseNumber = ko.observable();
    this.houseId = ko.observable();
    this.date = "";
    this.regionId = ko.observable();
    this.regionName = ko.observable();
    this.selfValue = ko.observable("Self value");

    //HistoryItem.prototype.all[initObj.date] = this;

    for(var key in initObj) {
        if(typeof this[key] !== undefined) {
            this[key] = initObj[key];
        }
    }
    return this;
};

HistoryItem.prototype.all = [];

HistoryItem.prototype = {
    clear: function() {
        window.localStorage.clear();
        this.history().splice(0, this.history().length);
    },
    removeItem: function(item) {
        this.all.splice(this.all.indexOf())
    }
}