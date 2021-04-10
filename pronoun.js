// Resource for scripts to find + use correct pronouns for characters in their outputs

/*
pronoun(word, gender_key)
	Returns the gendered version of the given word based on the `gender_key` provided. If a `gender_key` isn't provided, will default to gender-neutral: `they`.
	Valid words: `they`, `them`, `their`, `theirs`, `theirself`
	Valid gender_keys: `he`, `she`, `they`, `it`

getWorldInfo(key)
	Retrieves a World Info object based on the provided key. It'll return the first entry, if any are found. Use to get the world info on your desired character!

getWorldInfoPronoun(entry)
	Extracts and returns a character's pronoun from their world info entry (assuming one is contained within it)
	Requires that the World Info entry has an appropriately formatted pronoun field, which is formatted as `PRONOUN: pronoun_here;` (as the old character info used to be formatted). `pronoun_here` should be either `he`, `she`, `they`, or `it`. If not found / not formatted correctly, will default to using `they`. You can edit `entry_start` and `entry_end` inside the function to change how it's formatted if your world info entries for your characters use a different format.
	Provide the entry part specifically from a World Info object! So for example if you were using `getWorldInfo` to retrieve the info of your character, you should do: `getWorldInfoPronoun(getWorldInfo(your_character_here).entry)`
	Note: Requires that the PRONOUN field closes with a semicolon, which won't be the case naturally if PRONOUN is the last field. Edit you World Info accordingly.
*/

/* Example
let gender = "he"

console.log(`${pronoun("they", gender)} looks at ${pronoun("theirself", gender)} in the mirror. ${pronoun("they", gender)} realises why everyone was looking at ${pronoun("them", gender)} funny - ${pronoun("their", gender)} hair is a mess.`)
// (You'd use your own function to make the first letters in  the sentences uppercase, of course :P)
*/

const pronounData = {
	he: {
		they: "he",
		them: "him",
		their: "his",
		theirs: "his",
		theirself: "himself",
	},
	she: {
		they: "she",
		them: "her",
		their: "her",
		theirs: "hers",
		theirself: "herself",
	},
	they: {
		they: "they",
		them: "them",
		their: "their",
		theirs: "theirs",
		theirself: "theirself",
	},
	it: {
		they: "it",
		them: "it",
		their: "its",
		theirs: "its",
		theirself: "itself",
	}
}

// Returns a string for the appropriate gendered version of the provided word
// For words, use the neuter version. options are: "they", "them", "their", "theirs", "theirself"
// Gender should either be "he", "she", "they", or "it"
function pronoun(word, gender = "they") {
	return pronounData[gender][word]
}

// Takes a world info entry and extracts the pronoun from the pronoun field (assuming it's included)
// Supports "he", "she", "they", "it"
function getWorldInfoPronoun(entry) {
	// Edit these for tuning
	const entry_start = "PRONOUN: "
	const entry_end = ";"
	
	//let matches = entry.match(/(?:PRONOUN: )([^;]*)(?:;)/)
	let matches = entry.match(new RegExp("(?:" + entry_start + ")([^;]*)(?:" + entry_end + ")"))
	
	if (matches && matches.length >= 1) {
		return matches[1].trim().toLowerCase()
	}
	
	// Default to using "they" if not found / improperly formatted
	return "they"
}

// returns the worldInfo object for the character with the provided key, if found
function getWorldInfo(key) {
	for (i = 0; i < worldInfo.length; i++) {
		if (worldInfo[i].keys.toLowerCase().includes(key.toLowerCase())) {
			return worldInfo[i]
		}
	}
	
	// Didn't find it
	return null
}