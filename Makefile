antlr:
	test build || mkdir -f build
	antlr4 -Dlanguage=JavaScript -o build asn.g

all: antlr
