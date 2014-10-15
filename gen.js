

var p1 = ['i', 'î'].map(function(l) {
	return 'bo'+l+'te';
})

var p2 = ['à', 'au', 'aux']

var p3 = ['', 's'].map(function(l) {
	return 'lettre'+l;
})

var solutions = [];

p1.forEach(function(m1) {

	p2.forEach(function(m2) {

		p3.forEach(function(m3) {

			solutions.push(m1 + ' ' + m2 + ' ' + m3);

		})

	})

})

console.log(solutions.length)
console.log(solutions);