"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
        layout = frame.layout(),
        model = function() { return frame.model(); },
        client = function(id) { return frame.model().clients.find(id); },
        node = function(id) { return frame.model().nodes.find(id); },
        cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
        wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
        subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
            .after(500, function () {
                frame.model().title = '<h2 style="visibility:visible">Leader Election</h1>'
                    + '<br/>' + frame.model().controls.html();
                layout.invalidate();
            })
            .after(200, wait).indefinite()
            .after(500, function () {
                model().title = "";
                layout.invalidate();
            })

        //------------------------------
        // Initialization
        //------------------------------
            .after(300, function () {
                model().nodes.create("A").init();
                model().nodes.create("B").init();
                model().nodes.create("C").init();
                cluster(["A", "B", "C"]);
            })

        //------------------------------
        // Election Timeout
        //------------------------------
            .after(1, function () {
                model().ensureSingleCandidate();
                model().subtitle = '<h2>At the begining each nodes are in the <pan style="color:blue">follower</span> state</h2>'
                    + model().controls.html();
                layout.invalidate();
            })

            .after(model().electionTimeout / 2, function() { model().controls.show(); })

            .after(1, function () {
                subtitle('<h2>The timeout is set randomly between 150ms and 300ms</h2>');
            })

            .after(1, function() {
                subtitle("", false);
            })

        //------------------------------
        // Candidacy
        //------------------------------
        // To know when a node transition into candidate
            .at(model(), "stateChange", function(event) {
                return (event.target.state() === "candidate");
            })

            .after(1, function () {
                subtitle('<h2>Candidate votes for him</h2>');
            })

            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle('<h2>Sends a vote request</h2>');
            })

            .after(model().defaultNetworkLatency, function () {
                subtitle('<h2>The others grant a vote</h2>');
            })

        //------------------------------
        // Leadership & heartbeat timeout.
        //------------------------------
            .at(model(), "stateChange", function(event) {
                return (event.target.state() === "leader");
            })
            .after(1, function () {
                subtitle('<h2>Sends heartbeat</h2>');
            })
        
            .after(1, function() {
                subtitle("", false);
            })

        //------------------------------
        // Leader re-lection.
        //------------------------------
            .after(model().heartbeatTimeout * 2, function () {
                subtitle('<h2>Leader crashed</h2>', false);
            })
            .after(100, wait).indefinite()
            .after(1, function () {
                subtitle('', false);
                model().leader().state("stopped");
            })
            .after(model().defaultNetworkLatency, function () {
                model().ensureSingleCandidate()
            })
            .at(model(), "stateChange", function(event) {
                return (event.target.state() === "leader");
            })


        //------------------------------
        // Split vote resolution
        //------------------------------
            .after(model().heartbeatTimeout * 2, function () {
                subtitle('<h2>Split majority</h2>', false);
            })
            .after(1, wait).indefinite()
            .after(1, function () {
                subtitle('', false);
                model().nodes.create("D").init().currentTerm(node("A").currentTerm());
                cluster(["A", "B", "C", "D"]);
                
                // Make sure two nodes become candidates at the same time.
                model().resetToNextTerm();
                var nodes = model().ensureSplitVote();
                
                // Increase latency to some nodes to ensure obvious split.
                model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
                model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
            })
        
            .at(model(), "stateChange", function(event) {
                return (event.target.state() === "candidate");
            })
        
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle('<h2>Many nodes trigger an election at the same time</h2>');
            })

            .at(model(), "stateChange", function(event) {
                return (event.target.state() === "candidate");
            })
        
            .after(model().defaultNetworkLatency * 0.25, function () {
                subtitle('<h2>A node re-trigger an election</h2>');
            })
        
        player.play();
    };
});
