var pre = "ERROR : ";
var post = "";

// TODO factory cool stuff to handle pre + post

module.exports = {
	missingType: function(n) {
		return pre + "node " +  n + " has no type";
	},

	missingHandler: function(n) {
		return pre + " handler not implemented for " + n.type;
	},

	identifierConflict: function(ids) {
		return pre + "conflicting identifier in " + ids.toString();
	},

	callExpressionExpected: function(call) {
		return pre + "expected a CallExpression, but got " + call.name;
	},

	multipleOccurences: function(ocs) {
		return pre + "expected only one occurence, but got several : " + ocs;
	}
}