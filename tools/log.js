/**
 * Copyright 2020 VietAnhJp93 Inc. All rights reserved.
 *
 * Log 
 */



function log(level, detail) {
    if (global.logFlag) {
        if (level >= global.logLevel) {
            console.log(detail);
        }
    }
}

exports.logFunc = log;