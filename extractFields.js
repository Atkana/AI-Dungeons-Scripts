// Extract character info fields from a character's World Info entry.
/*
Formatting is based off of the old(?) system for character info, where each field is written in allcaps, followed by a colon, then the information, and closed with a semi colon e.g: "APPEARANCE: long pointy ears, dark hair, lithe and unsettlingly tall;"
NOTE: Technically this won't capture the last fields, as they don't by default end with a semicolon. Edit your World Info accordingly.
*/

// Returns an object containing the character info fields within the provided text. Each field is used as the key, while the info is the string stored under that key.
function getCharacterFields(world_info_entry) {
	let fields = {}
	
	// Find every block of field text
	const full_fields = world_info_entry.match(/([A-Z ]+):(.[^;]*);/g)
	if (full_fields) {
		// Extract the info from each individual entry
		for (i = 0; i < full_fields.length; i++) {
			const this_field = full_fields[i].match(/([A-Z ]+):(.[^;]*);/)
			
			if (this_field) {
				// this_field[1] will be the field name e.g. APPEARANCE
				// this_field[2] will be the actual entry e.g. long pointy ears, dark hair, lithe and unsettlingly tall
				fields[this_field[1].trim()] = this_field[2].trim()
			}
		}
	}
	
	return fields
}

// returns the worldInfo object for the character with the provided key, if found
// (copypasta'd from pronoun.js :p)
function getWorldInfo(key) {
	for (i = 0; i < worldInfo.length; i++) {
		if (worldInfo[i].keys.toLowerCase().includes(key.toLowerCase())) {
			return worldInfo[i]
		}
	}
	
	// Didn't find it
	return null
}