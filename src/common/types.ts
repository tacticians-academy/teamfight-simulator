export type HexCoord = [col: number, row: number]

export type StarLevel = 1 | 2 | 3 | 4
export type TeamNumber = 0 | 1

export enum StatusEffectType {
	ablaze = 'ablaze',
	aoeDamageReduction = 'aoeDamageReduction',
	armorReduction = 'armorReduction',
	attackSpeedSlow = 'attackSpeedSlow',
	banished = 'banished',
	ccImmune = 'ccImmune',
	disarm = 'disarm',
	empowered = 'empowered',
	grievousWounds = 'grievousWounds',
	invulnerable = 'invulnerable',
	magicResistReduction = 'magicResistReduction',
	stealth = 'stealth',
	stunned = 'stunned',
	unstoppable = 'unstoppable',
}

export enum MutantType {
	AdrenalineRush = 'Adrenaline',
	BioLeeching = 'BioLeeching',
	Cybernetic = 'Cyber',
	Metamorphosis = 'Metamorphosis',
	SynapticWeb = 'Synaptic',
	Voidborne = 'Voidborne',
	VoraciousAppetite = 'Voracious',
}
