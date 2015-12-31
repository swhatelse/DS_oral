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
            subtitle('<h2>Candidate:<ul><li>Votes for him</li></ul></h2>');
        })

        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>Candidate:<ul><li>Votes for him</li><li>Sends a vote request</li></ul></h2>');
        })

            .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Candidate:<ul><li>Votes for him</li><li>Sends a vote request</li><li>Others vote for him</li></ul></h2>');
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
        
        player.play();
    };
});
