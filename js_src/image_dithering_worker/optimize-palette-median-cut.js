/**
 * Color quantization vanilla median cut algorithm
*/
App.OptimizePaletteMedianCut = (function(PixelMath){
    /**
     * Median cut stuff
    */
    function createMedianCutArray(pixels){
        let ret = [];
        for(let i=0;i<pixels.length;i+=4){
            //ignore transparent pixels
            if(pixels[i+3] > 0){
                //don't save alpha value, since we don't need it
                ret.push(pixels.subarray(i, i+3));
            }
        }
        return ret;
    }

    function findLongestAxis(pixels){
        let rMin = 256;
        let rMax = -1;
        let gMin = 256;
        let gMax = -1;
        let bMin = 256;
        let bMax = -1;
        pixels.forEach((pixel)=>{
            rMin = Math.min(pixel[0], rMin);
            rMax = Math.max(pixel[0], rMax);
            gMin = Math.min(pixel[0], gMin);
            gMax = Math.max(pixel[0], gMax);
            bMin = Math.min(pixel[0], bMin);
            bMax = Math.max(pixel[0], bMax);
        });
        const rRange = rMax - rMin;
        const gRange = gMax - gMin;
        const bRange = bMax - bMin;
        const maxRange = Math.max(rRange, gRange, bRange);

        //prioritized by g, r, b, since the eye is most sensitive to values in that order
        switch(maxRange){
            case gRange:
                return 1;
            case rRange:
                return 0;
            //blue
            default:
                return 2;
        }
    }

    function sortOnLongestAxis(pixels){
        const sortIndex = findLongestAxis(pixels);
        return pixels.sort((a, b)=>{
            return a[sortIndex] - b[sortIndex];
        });
    }

    function extractMedians(pixelArray, numCuts){
        const numColors = Math.pow(2, numCuts);
        const divisionSize = Math.round(pixelArray.length / numColors);

        let ret = [];

        for(let i=0,currentColor=1;currentColor<=numColors;i+=divisionSize,currentColor++){
            let endIndex = i+divisionSize;
            if(currentColor === numColors){
                endIndex = pixelArray.length;
            }
            const medianIndex = Math.floor((endIndex - i) / 2) + i;
            ret.push(pixelArray[medianIndex]);
        }
        return ret;
    }

    function pixelArrayToBuffer(pixelArray){
        let ret = new Uint8Array(pixelArray.length * 3);
        for(let i=0,offset=0;i<pixelArray.length;i++, offset+=3){
            const pixel = pixelArray[i];
            ret[offset] = pixel[0];
            ret[offset+1] = pixel[1];
            ret[offset+2] = pixel[2];
        }

        return ret;
    }

    function removeDuplicatePixelsWithinLimit(pixelArray, minSize){
        function pixelKey(pixel){
            return `${pixel[0]}-${pixel[1]}-${pixel[2]}`;
        }
        let ret = [];
        let keys = {};
        const maxSkipped = pixelArray.length - minSize;
        let numSkipped = 0;

        pixelArray.forEach((pixel)=>{
            if(numSkipped < maxSkipped){
                const key = pixelKey(pixel);
                if(keys[key]){
                    numSkipped++;
                    return;
                }
                keys[key] = true;
            }
            ret.push(pixel);
        });

        return ret;
    }

    //prune colors by taking darkest and lightest colors
    //and middle lightest colors
    function mergeMedians(medianPixels, numColors){
        let ret = new Array(numColors);
        medianPixels = medianPixels.sort((pixel1, pixel2)=>{
            return PixelMath.lightness(pixel1) - PixelMath.lightness(pixel2);
        });
        medianPixels = removeDuplicatePixelsWithinLimit(medianPixels, numColors);
        if(medianPixels.length === numColors){
            return medianPixels;
        }

        ret[0] = medianPixels[0];
        ret[ret.length - 1] = medianPixels[medianPixels.length - 1];

        let offset = Math.floor((medianPixels.length - ret.length) / 2);
        for(let i=1,pixelArrayOffset=offset;i<ret.length-1;i++,pixelArrayOffset++){
            ret[i] = medianPixels[pixelArrayOffset];
        }
        return ret;
    }

    function medianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        //get number of times we need to divide pixels in half and sort
        const numCuts = Math.ceil(Math.log2(numColors));
        let pixelArray = createMedianCutArray(pixels);

        let divisions = 1;
        for(let i=0;i<numCuts;i++){
            const divisionSize = Math.round(pixelArray.length / divisions);
            for(let j=0, currentDivision=1;currentDivision<=divisions;j+=divisionSize,currentDivision++){
                let endIndex = j+divisionSize;
                //last index might not be slighty smaller or larger than necessary,
                //so set it to array length to be sure
                if(currentDivision === divisions){
                    endIndex = pixelArray.length;
                }
                sortOnLongestAxis(pixelArray.slice(j, endIndex));
            }
            divisions *= 2;
        }

        let medianColors = extractMedians(pixelArray, numCuts);
        if(medianColors.length > numColors){
            medianColors = mergeMedians(medianColors, numColors);
        }

        return pixelArrayToBuffer(medianColors);
    }

    return {
        medianCut,
    };
})(App.PixelMath);