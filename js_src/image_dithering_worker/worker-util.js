App.WorkerUtil = (function(WorkerHeaders, Pixel, Polyfills){    
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function copyBufferWithMessageType(pixelBufferOriginal, messageTypeId){
        //faster than using for loop
        const copiedBuffer = new Polyfills.SharedArrayBuffer(pixelBufferOriginal.byteLength + 1);
        const copiedPixels = new Uint8Array(copiedBuffer);
        
        //add messagetypeid to start of pixelbuffer
        copiedPixels[0] = messageTypeId;
        const copiedPixelsSubarray = copiedPixels.subarray(1, copiedPixels.length);
        copiedPixelsSubarray.set(new Uint8Array(pixelBufferOriginal));
        
        return {buffer: copiedBuffer, pixels: copiedPixelsSubarray};
    }

    function createOptimizePaletteBuffer(colors, messageTypeId, colorQuantizationModeId){
        //faster than using for loop
        const buffer = new Polyfills.SharedArrayBuffer(colors.length + 2);
        const array = new Uint8Array(buffer);
        
        array[0] = messageTypeId;
        array[1] = colorQuantizationModeId;
        const copiedPixelsSubarray = array.subarray(2, array.length);
        copiedPixelsSubarray.set(colors);
        
        return buffer;
    }

    //percent done is integer 1-100
    function createOptimizePaletteProgressBuffer(colorQuantizationModeId, colorCount, percentage){
        const buffer = new Polyfills.SharedArrayBuffer(4);
        const array = new Uint8Array(buffer);
        array[0] = WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS;
        array[1] = colorQuantizationModeId;
        array[2] = colorCount;
        array[3] = percentage;
        
        return buffer;
    }
    
    function createHistogramBuffer(length, messageTypeId){
        const buffer = new Polyfills.SharedArrayBuffer(length + 1);
        const fullArray = new Uint8Array(buffer);
        
        fullArray[0] = messageTypeId;
        const histogramArray = fullArray.subarray(1, fullArray.length);
        
        return {buffer: buffer, array: histogramArray};
    }
    
    function parseColorDitherMessageHeader(messageData){

        const messageHeader = {
            messageTypeId: messageData[0],
            imageWidth : messageData[1],
            imageHeight : messageData[2],
            algorithmId : messageData[3],
            colorDitherModeId : messageData[4],
        };

        const colorsRaw = messageData.subarray(5);
        const colors = [];
        for(let i=0;i<colorsRaw.length;i+=3){
            colors.push(colorsRaw.subarray(i, i+3));
        }
        messageHeader.colors = colors;

        return messageHeader;
    }
    
    function parseDitherMessageHeader(messageData){
        const messageTypeId = messageData[0];
        
        const messageHeader = {
            messageTypeId: messageTypeId,
            imageWidth : messageData[1],
            imageHeight : messageData[2],
            algorithmId : messageData[3],
            threshold : messageData[4],
        };
        if(messageTypeId === WorkerHeaders.DITHER){
            messageHeader.blackPixel = Pixel.create(messageData[5], messageData[6], messageData[7]);
            messageHeader.whitePixel = Pixel.create(messageData[8], messageData[9], messageData[10]);   
        }
        else{
            messageHeader.blackPixel = Pixel.create(0, 0, 0);
            messageHeader.whitePixel = Pixel.create(255, 255, 255);
        }
        return messageHeader;
    }
    
    function parseLoadImageMessageHeader(messageData){
        const messageHeader = {
            messageTypeId: messageData[0],
            imageWidth : messageData[1],
            imageHeight : messageData[2],
        };

        return messageHeader;
    }
    
    function parseMessageHeader(headerBuffer){
        const messageData = new Uint16Array(headerBuffer);
        const messageTypeId = messageData[0];
        
        switch(messageTypeId){
            case WorkerHeaders.LOAD_IMAGE:
                return parseLoadImageMessageHeader(messageData);
            case WorkerHeaders.DITHER:
            case WorkerHeaders.DITHER_BW:
                return parseDitherMessageHeader(messageData);
            case WorkerHeaders.DITHER_COLOR:
                return parseColorDitherMessageHeader(messageData);
            case WorkerHeaders.HISTOGRAM:
            case WorkerHeaders.HUE_HISTOGRAM:
                return {messageTypeId: messageTypeId};
            case WorkerHeaders.OPTIMIZE_PALETTE:
                return {
                            messageTypeId: messageTypeId, 
                            numColors: messageData[1], 
                            colorQuantizationModeId: messageData[2],
                        };
            default:
                return null;
        }
    }
    
    
    return {
        // copyBuffer: copyBuffer,
        copyBufferWithMessageType,
        createHistogramBuffer,
        createOptimizePaletteBuffer,
        createOptimizePaletteProgressBuffer,
        parseMessageHeader,
    };
})(App.WorkerHeaders, App.Pixel, App.Polyfills);