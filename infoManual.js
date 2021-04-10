// Resource for supplying an extended amount of information for the player to read, like a user manual. Useful if you can't fit everything into the 2,000 character prompt!

/* HOW TO USE
1) Create a Scenario. This will be both the Scenario you publish, as well as the container for the ACTUAL scenario, and your manual. This will be referenced as the "Holder Scenario".
2) Add a Scenario Option to this Holder Scenario - fill out all its details as you normally would for a Scenario. This option will be the one that players actually play.
3) Add a second Scenario Option to the Holder Scenario. This will be used as your manual - displaying information about your scenario for your player to read. Name it something appropriate like "Manual" or "Info" or "Readme" so the player knows what the option is.
4) By now you should have your Holder Scenario with 2 options, confirm that's the case. Ideally you'll want to create these Scenario Options in this order so that the Scenario the player will play is option 1, because I don't think you can change the order of Scenario Options once created.
5) Start editing the second Scenario Option - the one for the manual. Edit its prompt to be the first entry / page of your manual, or some general introduction to the manual.
6) Open up the scripts page for this Scenario Option. Paste this block of code into its Input Modifier.
7) Now, edit `info_entries` to contain each of your entries. You'll need to know a little bit about javascript formatting for this, but there's an example included just below it that might clue you in well enough.
8) Commented out at the bottom of this file is a section for the Context Modifier. Copy and paste that into the Context Modifier section and uncomment the code (remove the lines with slashes and asterisks at the start and end). This stage is important, because it'll prevent the AI from trying to add on an output and spending the player's energy in the process!
9) Save everything, and that should be that.

Optional: You can edit the text inside `tuning` if you want the hints to say something different to the player.
*/

/* Notes on character limits:
Player input seems to be limited to 4,000 characters (carriage returns / linefeeds (aka newlines) aren't counted against this limit)
Edit input seems to be limited to 10,000 characters (again, newlines aren't counted)

Just to play it safe, try to ensure that each entry is below 4,000 characters in length
*/

const info_entries = [
	// Put your entries in here
]
/* EXAMPLE INFO ENTRIES
const info_entries = [
	// Wrap each entry inside `s, and place a comma after the end of each
	`Welcome to my amazing manual. Don't worry about using up energy here - anything you input won't cost anything!`,
	`This is the second page of my manual...`,
	`This is the third page\nwith a newline in it!`,
	`I hope I remembered to put commas at the end of each section, otherwise the script will error :c`,
]
*/

const tuning = {
	more_to_go_hint: `Enter "next" to continue...`, // Message displayed to the player when there's more to read. Technically any non-blank entry will be valid, but the player doesn't need to know that! :p
	finished_hint: `End of manual`, // Message displayed to player when there are no more entries left to view.
}

// YOU DON'T NEED TO MODIFY ANYTHING BELOW THIS LINE
// ---------------------------------------------------------------------

const modifier = (text) => {
	let modified_text = text
	
	if (!state.initialized) {
		state.initialized = true
		state.page_num = 0
		state.message = tuning.more_to_go_hint
	}
	
	if (info_entries[state.page_num]) {
		modified_text = info_entries[state.page_num] + "\n"
		state.page_num++
	}
	
	if (!info_entries[state.page_num]) { // If there's no next page... (next page because the previous if block advanced the page counter)
		state.message = tuning.finished_hint
	}
	
	return { text: modified_text}
}

modifier(text)

// ---------------------------------------------------------------------
/*
// CONTEXT MODIFIER

const modifier = (text) => {
	return { text, stop: true}
}

modifier(text)
*/