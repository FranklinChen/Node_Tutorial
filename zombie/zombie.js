var zombie = require("zombie"),
    assert = require("assert");

/*
*  Browse to a local file, and if it's found, we get a headless browser object back
*/
zombie.visit("http://127.0.0.1:8081/lorem.htm", 
	{debug: true}, 
	function(err, browser) {

		// Log any error that occurs
		if (err) {
			console.log(err.message);

		// Yay, no error!
		} else {
			// In the resultant HTML, look for a link with an id of mockey
			assert.ok(browser.querySelector("#mickey"));

			// Click the link and we get a browser object back 
		    	browser.clickLink("#mickey", function(err, browser) {
		      		if (err) {
				        console.log(err.message);
			      	} else {
					try {
						// Make sure we have an element with the ID brains.
						assert.ok(browser.querySelector("#gotcha"));
				
						// Make sure body has two elements with the class hand.
						assert.equal(browser.body.querySelectorAll(".tiny").length, 2);
				
						// Check the document title.
						assert.equal(browser.text("title"), "Gotcha");
				
						// Show me the document contents.
						console.log(browser.html());
				
						// Show me the contents of the parts table:
						console.log(browser.html("table.parts"));
					} catch (e) {
						var stack = e.stack.split(':');
						console.log('Assertion Error ');
						console.log('--------------------------------------------------');
						console.log(stack[1] + ':' + stack[2]);
					}
				}
			});
		}
});
