grammar Fluxion;

program
	: fluxion EL program EOF!

fluxion
	: link LT signature LT code

link
	: name WS '→' WS outputs

signature
	: '[' (identifier* Identifier)? ']'


outputs
	: identifier* Identifier | empty

code
	: codeBlock (placeholder code)?

placeholder 
	: (StartPh | PostPh) WS name

name
	: identifier


identifier
	: Identifier ',' WS


Empty
	: 'ø'

StartPh
	: '↠'

PostPh
	: '→'


codeBlock
	: Javascript block code

Identifier
	: Javascript Identifier

EL  // Empty Line
	: LT WS LT

WS
	: One or more white space

LT
	: One or more line return