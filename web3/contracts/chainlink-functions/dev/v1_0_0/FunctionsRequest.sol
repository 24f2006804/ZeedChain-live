// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FunctionsRequest {
    struct Request {
        string source;
        bytes encryptedSecretsReference;
        string[] args;
        bytes[] bytesArgs;
    }

    function initializeRequest(
        Request memory self,
        string memory source
    ) internal pure {
        self.source = source;
    }

    function initializeRequestForInlineJavaScript(
        Request memory self,
        string memory source
    ) internal pure {
        self.source = source;
    }

    function addArgs(Request memory self, string[] memory args) internal pure {
        require(self.args.length == 0, "Args already set");
        self.args = args;
    }

    function addBytesArgs(Request memory self, bytes[] memory args) internal pure {
        require(self.bytesArgs.length == 0, "Bytes args already set");
        self.bytesArgs = args;
    }

    function setArgs(Request memory self, string[] memory args) internal pure {
        self.args = args;
    }

    function encodeCBOR(Request memory self) internal pure returns (bytes memory) {
        return abi.encode(self.source, self.args, self.bytesArgs);
    }
}