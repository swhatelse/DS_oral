
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./election2", "./replication"],
    function (playground, title, election2, replication) {
        return function (player) {
            player.frame("election2", "Leader Election", election2);
            player.frame("replication", "Log Replication", replication);
        };
    });
