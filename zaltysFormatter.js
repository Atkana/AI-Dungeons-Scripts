// Provides a unified system for building characters using commands. The script produces a character based on what was input in multiple different formats: Standard, Zaltys, and Snek (the supposedly more Griffin-friendly variation of Zaltys format)

/* INTERNAL:
Code will always use the following forms internally:
- APPEARANCE, for the APPEARANCE/APPEAR/APP field.
- MIND, for the MIND/MENT/MENTAL field.
*/

const tuning = {
	// Order in which fields appear in listing. Fields not included will be added onto the end in alphabetical order
	// Name, ID, what, height, weight, age are all special-case, and inserted near the start
	// Technically not the traditional standard prompt order (appearance usually goes after Equipment)
	field_order: ["APPEARANCE", "MIND", "WORN", "EQUIP", "SUMMARY", "DESCRIPTION"],
	
	command_symbols: ":/", // Symbols which denote the start of a command
	
	go_command: "generate", // If go command is detected, will generate character World Infos after finishing processing the remaining input.
	
	initial_prompt:`Command Reminders:
-- Required fields --
/name (The character / object's full name)
/id (A short, unique identifier that can identify)
/what (What the character / object is e.g. Human or A popular drink)

-- Common Fields --
/appearance (Traits about their appearance)
/mind (Traits about their personality)
/worn (What they wear)
/equip (What they have / use / wield)
/summary (Basically any traits or important notes)

-- Descriptor Fields --
/height (Their height)
/weight (Their weight)
/age (Their age, formatted as [age]y e.g. 20y)
/gender (Their gender e.g. "Male")

-- Special Commands --
/standard (A full World Info entry of a character in standard format. This includes the bit the (Character Name): bit at the start.)
/clear
/generate

Once you've input everything, use /generate to produce the outputs.
`,
}

//const standard_fields = ["ID", "NAME", "WHAT", "APPEARANCE", "MIND", "WORN", "SUMMARY", "HEIGHT", "WEIGHT", "AGE"] // Forgot what this is for and it never got used :?

// Tells the iterators to skip the given fields when creating the entry (presumably because they're handled as special cases)
const ignore_fields = {
	standard: ["GENDER", "WHAT", "HEIGHT", "WEIGHT", "AGE", "ID", "NAME"],
	zaltys: ["GENDER", "WHAT", "HEIGHT", "WEIGHT", "AGE", "ID", "NAME", "DESCRIPTION"],
	snek: ["GENDER", "WHAT", "HEIGHT", "WEIGHT", "AGE", "ID", "NAME", "DESCRIPTION"],
}

// appearance 

// Translations From Other -> Format
const field_translations = {
	internal: { // (For turning user inputs into internal formats)
		"APPEAR": "APPEARANCE",
		"APPE": "APPEARANCE",
		"APP": "APPEARANCE",
		"MENT": "MIND",
		"MENTAL": "MIND",
		"TRA": "SUMMARY",
		"TRAIT": "SUMMARY",
		"TRAITS": "SUMMARY",
		"WEAR": "WORN",
		"CLOTHES": "WORN",
		"CLOTHING": "WORN",
		"DRESS": "WORN",
		"COSTUME": "WORN",
		"RACE": "WHAT",
		"EQUIPMENT": "EQUIP",
		"DESC": "DESCRIPTION",
		"DESCRIP": "DESCRIPTION",
		"DESCRIPT": "DESCRIPTION",
		"DESCRIPTOR": "DESCRIPTION",
	},
	// The rest are for turning internal into their format's preferred forms:
	standard: {
		"APPE": "APPEARANCE",
		"APPEAR": "APPEARANCE",
		"MIND": "MENTAL",
		"EQUIP": "EQUIPMENT",
		"WORN": "EQUIPMENT", // TODO: Test if causes problems
	},
	
	zaltys: {
		"APPEARANCE": "APPE",
	},
	snek: {
		"APPEARANCE": "APPE",
		"MIND": "MENT",
		// Based off of provided examples, snek format uses TRA (probably shortened TRAITS) instead of SUMMARY, even though the guide says SUMMARY is better (?)
		"SUMMARY": "TRA",
	},
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function generate_standard(fields){
	// STEP - BUILD THE DESCRIPTION FIELD
	// Standard format has its own field for (race, gender, weight, height, age) data - DESCRIPTION
	// We'll make an entry for that here before processing everything
	let description_text = "" //We'll do this in an easy to follow, but less efficient way
	
	// Add gender (if applicable)
	description_text += (fields["GENDER"]) ? fields["GENDER"] + " " : ""
	
	// Add race (AKA. what)
	description_text += fields["WHAT"]
	
	// Add bracketed details if present
	if (fields["HEIGHT"] || fields["WEIGHT"] || fields["AGE"]) {
		description_text += " ("
		
		// Work out which descriptors are present so we can both order them, and handle them in a way so we know if there's a next one (so we can append ", " onto the ends of entries)
		let present_descriptor_fields = []
		for (let current_field of ["HEIGHT", "WEIGHT", "AGE"]) {
			if (fields[current_field]) {
				present_descriptor_fields.push(current_field)
			}
		}
		
		for (let index = 0; index < present_descriptor_fields.length; index++) {
			let current_field = present_descriptor_fields[index]
			description_text += fields[current_field]
			
			if (present_descriptor_fields[index + 1]) {
				description_text += ", "
			}
		}
		
		description_text += ")"
	}
	// While not exactly the best idea, we'll add this to the main fields record
	fields["DESCRIPTION"] = description_text
	
	// STEP - CORRECTLY ORDER EVERY PRESENT FIELD
	let ordered_fields = []
	
	// tuning.field_order outlines a list of fields with a fixed order
	// Record any of them that we have in the correct order
	for (let current_field of tuning.field_order) {
		if (fields[current_field] && !ignore_fields.standard.includes(current_field)) {
			ordered_fields.push(current_field)
		}
	}
	
	// Any other fields are placed afterwards in alphabetical order
	let remaining_fields = []
	
	for (let current_field in fields) {
		if (!tuning.field_order.includes(current_field) && !ignore_fields.standard.includes(current_field)) {
			remaining_fields.push(current_field)
		}
	}
	
	remaining_fields.sort()
	
	//ordered_fields = ordered_fields.push(...remaining_fields)
	ordered_fields = ordered_fields.concat(remaining_fields)
	
	// STEP - MAKE THE TEXT
	let text = `${fields.NAME}: `
	
	for (let index = 0; index < ordered_fields.length; index++) {
		let current_field = ordered_fields[index]
		
		text += `${(field_translations.standard[current_field]) ? field_translations.standard[current_field] : current_field}: ${fields[current_field]}${(current_field[index + 1]) ? "; " : ""}` // See, this is why I broke the description creation into multiple parts :P
	}
	
	return text
}

// Performs basic formatting changes for standard Zaltys format
function zaltys_reformat(text){
	let new_text = text
	
	/* Notes on format
	" and "
		-> " & "
	thing (some details)
		-> thing:<some details>
	remove all periods from input - even in quotes!
	no newlines
	*/
	// (Turns out replaceAll isn't available everywhere, so we'll have to use replace with global regex instead)
	
	// Replace " and " with " & "
	new_text = new_text.replace(/ and /g, " & ")
	
	// Remove periods
	new_text = new_text.replace(/\./g, "")
	
	// Remove newlines
	new_text = new_text.replace(/[\n\r]/g, "")
	
	// Reformat bracketed information. (this should perhaps be done on a per-field basis, rather than generally applied to everything)
	new_text = new_text.replace(/ {1}\(([\s\S]*?)\)/g, (match, p1) => {
		return `:<${p1}>`
	})
	
	return new_text
}

function generate_zaltys(fields){
	// STEP - CORRECTLY ORDER EVERY PRESENT FIELD
	let ordered_fields = []
	
	// tuning.field_order outlines a list of fields with a fixed order
	// Record any of them that we have in the correct order
	for (let current_field of tuning.field_order) {
		if (fields[current_field] && !ignore_fields.zaltys.includes(current_field)) {
			ordered_fields.push(current_field)
		}
	}
	
	// Any other fields are placed afterwards in alphabetical order
	let remaining_fields = []
	
	for (let current_field in fields) {
		if (!tuning.field_order.includes(current_field) && !ignore_fields.zaltys.includes(current_field)) {
			remaining_fields.push(current_field)
		}
	}
	
	remaining_fields.sort()
	
	ordered_fields = ordered_fields.concat(remaining_fields)
	
	// STEP - MAKE THE TEXT
	let text = `${zaltys_reformat(fields.NAME)}:[`
	
	// Set up the description stuff
	text += zaltys_reformat(fields["WHAT"])
	
	if (fields["GENDER"] || fields["HEIGHT"] || fields["WEIGHT"] || fields["AGE"]) {
		text += "<"
		
		// Work out which descriptors are present so we can both order them, and handle them in a way so we know if there's a next one (so we can append ", " onto the ends of entries)
		let present_descriptor_fields = []
		for (let current_field of ["GENDER", "HEIGHT", "WEIGHT", "AGE"]) {
			if (fields[current_field]) {
				present_descriptor_fields.push(current_field)
			}
		}
		
		for (let index = 0; index < present_descriptor_fields.length; index++) {
			let current_field = present_descriptor_fields[index]
			text += zaltys_reformat(fields[current_field])
			
			if (present_descriptor_fields[index + 1]) {
				text += ", "
			}
		}
		
		text += ">."
	}
	
	text += " "
	
	// Now handle the fields
	for (let index = 0; index < ordered_fields.length; index++) {
		let current_field = ordered_fields[index]
		
		let formatted_text = zaltys_reformat(fields[current_field])
		let formatted_field = (field_translations.zaltys[current_field]) ? field_translations.zaltys[current_field] : current_field
		
		text += ` ${formatted_field}<${zaltys_reformat(fields["ID"])}>:${formatted_text}`
		if (ordered_fields[index + 1]) {
			text += "; "
		}
	}
	
	text += ".]"
	
	return text
}

// Performs basic formatting changes for Snek format
function snek_reformat(text){
	let new_text = text
	
	/* Notes on format
	" and "
		-> "&"
	thing (some details)
		-> thing:<some details>
	remove all periods from input - even in quotes!
	no newlines
	commas become /
	how are spaces employed in this????
	*/
	// (Turns out replaceAll isn't available everywhere, so we'll have to use replace with regex instead)
	
	// Replace " and " with " & "
	new_text = new_text.replace(/ and /g, " & ")
	
	// Remove periods
	new_text = new_text.replace(/\./g, "")
	
	// Remove newlines
	new_text = new_text.replace(/[\n\r]/g, "")
	
	// TEMP: Replace all commas followed by spaces with /
	new_text = new_text.replace(/, /g, "/")
	
	// Replace commas with /
	new_text = new_text.replace(/,/g, "/")
	
	// TODO: How the heck are spaces done in this format? :S
	
	// Reformat bracketed information. (this should perhaps be done on a per-field basis, rather than generally applied to everything)
	new_text = new_text.replace(/ {1}\(([\s\S]*?)\)/g, (match, p1) => {
		return `:<${p1}>`
	})
	
	return new_text
}

function generate_snek(fields){
	// STEP - CORRECTLY ORDER EVERY PRESENT FIELD
	let ordered_fields = []
	
	// tuning.field_order outlines a list of fields with a fixed order
	// Record any of them that we have in the correct order
	for (let current_field of tuning.field_order) {
		if (fields[current_field] && !ignore_fields.snek.includes(current_field)) {
			ordered_fields.push(current_field)
		}
	}
	
	// Any other fields are placed afterwards in alphabetical order
	let remaining_fields = []
	
	for (let current_field in fields) {
		if (!tuning.field_order.includes(current_field) && !ignore_fields.snek.includes(current_field)) {
			remaining_fields.push(current_field)
		}
	}
	
	remaining_fields.sort()
	
	ordered_fields = ordered_fields.concat(remaining_fields)
	
	// STEP - MAKE THE TEXT
	let text = `${snek_reformat(fields.NAME)}:[`
	
	// Set up the description stuff
	text += snek_reformat(fields["WHAT"])
	
	if (fields["GENDER"] || fields["HEIGHT"] || fields["WEIGHT"] || fields["AGE"]) {
		text += "<"
		
		// Work out which descriptors are present so we can both order them, and handle them in a way so we know if there's a next one (so we can append ", " onto the ends of entries)
		let present_descriptor_fields = []
		for (let current_field of ["GENDER", "HEIGHT", "WEIGHT", "AGE"]) {
			if (fields[current_field]) {
				present_descriptor_fields.push(current_field)
			}
		}
		
		for (let index = 0; index < present_descriptor_fields.length; index++) {
			let current_field = present_descriptor_fields[index]
			text += snek_reformat(fields[current_field])
			
			if (present_descriptor_fields[index + 1]) {
				text += "/"
			}
		}
		
		text += ">;"
	}
	
	// Now handle the fields
	for (let index = 0; index < ordered_fields.length; index++) {
		let current_field = ordered_fields[index]
		
		let formatted_text = snek_reformat(fields[current_field])
		let formatted_field = (field_translations.snek[current_field]) ? field_translations.snek[current_field] : current_field
		
		text += `${formatted_field}<${snek_reformat(fields["ID"])}>:${formatted_text}`
		if (ordered_fields[index + 1]) {
			text += ";"
		}
	}
	
	text += ".]"
	
	return text
}

// Extracts fields from the provided standard-formatted World Info entry
// Returns a filled-in fields object. Still requires an ID to be added to it, thought
function import_from_standard(text){
	let fields = {}
	let new_text = text
	
	// Scrub newlines
	new_text = new_text.replace(/[\n\r]/g, "")
	
	// Separate the character's name from their fields (Standard format World Infos begin with `Character Name: `)
	let colon_index = new_text.indexOf(":")
	
	if (colon_index == -1) return false // something is really wrong with this entry!
	
	let name = new_text.slice(0, colon_index).trim()
	let entries_text = new_text.slice(colon_index+1).trim()
	
	fields.NAME = name
	
	// Divide each entry into its full text versions so we can later separate them out easier
	let split_entries_text = entries_text.split(";")
	
	for (let current_entry_text of split_entries_text) {
		let matches = current_entry_text.match(/([A-Z]+\b)(?:: *)([\s\S]*)/)
		
		if (matches) {
			let field_name = matches[1].trim().toUpperCase()
			let field_text = matches[2]
			
			// Translate field_name to its internal equivalent
			field_name = (field_translations.internal[field_name]) ? field_translations.internal[field_name] : field_name
			
			if (field_name == "DESCRIPTION") { // Description is handled as a special case...
				// Try to extract age, height, weight (+ gender?) from description entry by looking for certain formats
				// Gender + Race will have to be combined into a singular WHAT because there's no foolproof way to divorce the two
				// What this'll do is attempt to capture all the regular words (including spaces, periods, and commas) leading up to the first non-standard symbol, hoping that'll mean parenthesise denoting extra info
				let starting_match = field_text.match(/([\w., ]+)/i)
				if (starting_match) {
					fields.WHAT = starting_match[1].trim()
				}
				
				// Grab weight
				// Check for lbs
				let weight_match = field_text.match(/(\d+)(?:lb)/i)
				if (weight_match) {
					fields.WEIGHT = weight_match[1] + "lbs"
				} else {
					// Check for kilos
					weight_match = field_text.match(/(\d+)(?:kg)/i)
					if (weight_match) {
						fields.WEIGHT = weight_match[1] + "kg"
					}
				}
				
				// Check for some formats of height...
				let height_match
				let height_text

				// (Yes, the assignments instead of conditionals are intentional!)
				if (height_match = field_text.match(/(\d+)(?:cm)/i)) {
					height_text = height_match[1] + "cm"
				} else if (height_match = field_text.match(/(\d+['′]\d+["″]+|\d+['′])/)) { 
					height_text = height_match[1]
				} else if (height_match = field_text.match(/(\d+)(?: *feet|foot|ft[. ]*)(\d+)(?: *inches|inch|in)/i)) {
					height_text = height_match[1] + " ft " + height_match[2] + " in"
				} else if (height_match = field_text.match(/(\d+)(?: *feet|foot|ft)/i)) {
					height_text = height_match[1] + " ft"
				}
				
				if (height_text) {
					fields.HEIGHT = height_text
				}
				
				// Age check is easy
				let age_match = field_text.match(/(\d+)(?: *y)/i)
				if (age_match) {
					fields.AGE = age_match[1] + "y"
				}
				
			} else {
				fields[field_name] = field_text
			}
			
		} else {
			// Something's wrong, with this field's formatting, so we'll skip
			continue
		}
	}
	
	return fields
}

// ---------------------------------------------------------------------
// INPUT MODIFIER

const modifier = (text) => {
	let modified_text = ""
	
	if (!state.initialized) {
		state.initialized = true
		state.stored_fields = {}
		modified_text = tuning.initial_prompt
	}
	
	state.message = ""
	
	let should_generate = false
	
	const lines = text.split("\n")
	for (let line of lines) {
		const command_matches = line.match(new RegExp("(?:[" + escapeRegExp(tuning.command_symbols) +"])(\\w+)(.*)", "i"))
		
		if (command_matches) {
			let command = command_matches[1].trim().toUpperCase()
			let args = command_matches[2].trim()
			
			// Translate the command into its internal equivalent (if possible)
			if (field_translations.internal[command]) {
				command = field_translations.internal[command]
			}
			
			// Handle clearing of already entered fields
			if (!args && state.stored_fields[command]) {
				delete state.stored_fields[command]
			} else {
				// other tests
				switch (command) {
					case "CLEAR":
						state.stored_fields = {}
						break
					case "STANDARD":
						let entry_text = text.slice(text.toUpperCase().indexOf("STANDARD") + ("STANDARD").length).trim() // Grab everything in the input that's beyond the /standard command
						let imported = import_from_standard(entry_text)
						
						if (imported) {
							state.stored_fields = imported
							state.message = "World Info processed successfully"
						} else {
							state.message = "There was an error processing the provided World Info"
						}
						break
					case (tuning.go_command.toUpperCase()):
						if (state.stored_fields["ID"] && state.stored_fields["NAME"] && state.stored_fields["WHAT"]) {
							should_generate = true
						} else {
							state.message = "Entry requires an ID, NAME, and WHAT before it can be generated"
						}
						break
					default:
						state.stored_fields[command] = args
				}
			}
		}
	}
	
	if (should_generate) {
		modified_text += `-= Standard Format =-\n${generate_standard(state.stored_fields)}\n\n`
		modified_text += `-= Zaltys Format =-\n${generate_zaltys(state.stored_fields)}\n\n`
		modified_text += `-= (A bad version of) Snek Format =-:\n${generate_snek(state.stored_fields)}\n`
	}
	
	// Helpful debugging
	console.log(`Current Info:`)
	for (let field in state.stored_fields) {
		console.log(`${field}: ${state.stored_fields[field]}`)
	}
	
	return {text: modified_text}
}

modifier(text)

// ---------------------------------------------------------------------
// CONTEXT MODIFIER

const modifier = (text) => {
	return {text, stop: true}
}

modifier(text)