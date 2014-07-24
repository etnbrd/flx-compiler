# flx-compiler

// # Fluxionnal compiler

// The audience’s growth a web application needs to adapt to, often leads its development team to quickly adopt disruptive and continuity-threatening shifts of technology.
// To avoid these shifts, we propose an approach that abstracts web applications into an high-level language, which authorizes code mobility to cope with audience dynamic growth and decrease.

// We think a web application can be depicted as a network of small autonomous parts moving from one machine to another and communicating by message streams.
// We named these parts fluxions, by contraction between a stream and a function.
// Fluxions are executed by the [Fluxionnal execution model](../flx-lib).
// Fluxions are distributed over a network of machines according to their interdependencies to minimize overall data transfers.

// **This compiler aims at extracting fluxions and their streams from traditional Javascript code.**

[![NPM version](https://badge.fury.io/js/flx-compiler.svg)](http://badge.fury.io/js/flx-compiler)
[![Build Status](https://travis-ci.org/etnbrd/flx-compiler.svg?branch=master)](https://travis-ci.org/etnbrd/flx-compiler)
[![Code Climate](https://codeclimate.com/github/etnbrd/flx-compiler.png)](https://codeclimate.com/github/etnbrd/flx-compiler)
[![Test Coverage](https://codeclimate.com/github/etnbrd/flx-compiler/coverage.png)](https://codeclimate.com/github/etnbrd/flx-compiler)