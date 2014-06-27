grammar Fluxion;

program
	: fluxion EL program EOF!
	;

fluxion
	: declaration ES outputs LT code
	;

declaration
	: Flx WS name
	;

outputs
	: ((output ES)* outputs)+ | emptyOutput
	;

output
	: link WS signature
	;

emmptyOutput
	: arrow WS Empty
	;

link 
	: arrow WS name
	;

signature
	: Ls ((Identifier Sep)* Identifier)? Rs
	;

code
	: CodeBlock (link code)?
	;


name
	: identifier
	;


arrow
	: Start
	| Post
	;

Flx
	: 'flx'
	;

Empty
	: 'ø'
	;

Start
	: '↠'
	;

Post
	: '→'
	;

Sep
	: ',' WS*
	;

Ls				// Left separator
	: '['
	;

Rs 				// Right separator
	: ']'
	;

CodeBlock		// block of Javascript code

identifier 		// Javascript Identifier

EL  			// Empty Line
	: LT WS LT;

ES				// Empty Space
	: LT
	| WS
	;

WS  			// One or more white spaces

LT  			// One or more line returns