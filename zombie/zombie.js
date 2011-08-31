var zombie = require("zombie"),
    assert = require("assert");

/*
*  Browse to a local file, and if it's found, we get a headless browser object back
*/
zombie.visit("http://127.0.0.1:8081/lorem.htm", 
	{debug: false}, 
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
						assert.ok(document.querySelector("#gotcha"));
				
						// Make sure body has two elements with the class hand.
						assert.equal(browser.body.querySelectorAll(".tiny").length, 2);
				
						// Check the document title.
						assert.equal(browser.text("title"), "Gotcha");
				
						// Show me the document contents.
						console.log('');
            console.log('  ****  ALL TESTS PASSED  ****');
            console.log('');
				
					} catch (e) {
					  console.log(e);
						var stack = e.stack.split(':');
            console.log('');
						console.log('  ****  ASSERTION ERROR  ****');
						console.log('  --------------------------------------------------------');
						console.log('  ' + stack[1] + ':' + stack[2]);
            console.log('  --------------------------------------------------------');
            console.log('');
					}
				}
			});
		}
});
