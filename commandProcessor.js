// Basic add-in for processing commands in a simple way
// Entering Commands: Each command should be on its own line, starting with one of the command symbols without a space between the symbol and the command. Even if configured to detect a command mid-line, only one command per line will be processed.

let command_config = {
	allow_inline: true, // Allows searching for commands within a given line. Allows easy use of commands even in "do" or "say" mode, but has the slight chance of accidentally picking up commands if something in the player's input shares the format
	command_symbols: ":/", // Symbols which denote the start of a command
	do_start: "> You ", // Not used currently
}

// Store the functions for every command here. The key should be the command in all lower case
let commands = {
	example: (args) => { console.log(args) }, // Example
}
// ALIASES START
// You can define aliases for commands out in the open here like this:
commands["exam"] = commands.example // With this, /exam can be used as shorthand for /example

// ALIASES END

// https://stackoverflow.com/a/6969486
function escape_reg_exp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Send in a passage of text, and the script will process any commands within it
function process_commands(text) {
	const lines = text.split("\n")
	
	for (let line of lines) {
		let command_matches
		
		if (command_config.allow_inline) {
			command_matches = line.match(new RegExp("(?:[" + escape_reg_exp(command_config.command_symbols) +"])(\\w+)(.*)", "i"))
		} else { // Requires the command to be at the very start of the line
			command_matches = line.match(new RegExp("(?:^[" + escape_reg_exp(command_config.command_symbols) +"])(\\w+)(.*)", "i"))
		}
		
		if (command_matches) { // There's a possible command on this line! (it meets the format requirements, but we still have to check the command exists)
			let command = command_matches[1].trim().toLowerCase()
			let args = command_matches[2].trim()
			
			if (command in commands) {
				// Run the command
				commands[command](args)
				
				// state.command_executed = true // Suggested: Use some sort of flag to let inputModifier know that the player input a command
			}
		}
	}
}


/*
// SUGGESTIONS:
// INPUT MODIFIER

// Very basic command setup.
// You may want different `command_returns` for different command types
// or handle whether `stop` should happen on a per-case basis
// but this is a good basic starting point

state.command_return = false // If a command wants to change the text, it should set this value to the string to use
state.command_executed = false // If you've made the suggested edit in `process_commands`, this'll be set to true whenever a command's function is run

process_commands(text)

if ( state.command_executed ) {
	if ( state.command_return != false) {
		return {text: state.command_return, stop: true}
	} else {
		return {text: "", stop: true}
	}
}
*/