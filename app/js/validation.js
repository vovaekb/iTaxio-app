var Validation = (function() {
    var validation = {};

    this.rules = this.rules || [];

    validation.validate = function() {
        console.log( "Validate function" );
        for(var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i];
            console.log( rule );
            var isFieldInvalid = rule.isInvalid.apply(this.context);
            if(isFieldInvalid) {
                return rule.message;
            }
        }
        return "";
    };

}());

