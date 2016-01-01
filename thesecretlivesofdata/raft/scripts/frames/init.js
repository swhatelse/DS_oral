
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./election2", "./replication", "./replication2"],
    function (playground, title, election2, replication, replication2) {
        return function (player) {
            player.frame("election2", "Leader Election", election2);
            player.frame("replication2", "Log Replication", replication2);
            player.frame("replication", "Log Replication", replication);
        };
    });
