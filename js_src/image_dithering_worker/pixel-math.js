App.PixelMath = (function(Pixel){
    const R_INDEX = Pixel.R_INDEX;
    const G_INDEX = Pixel.G_INDEX;
    const B_INDEX = Pixel.B_INDEX;
    const A_INDEX = Pixel.A_INDEX;
    
    function pixelLightness(pixel){
        var max = Math.max(pixel[0], pixel[1], pixel[2]);
        var min = Math.min(pixel[0], pixel[1], pixel[2]);
        return Math.floor((max + min) / 2.0);
    }
    
    //based on wikipedia formulas: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
    function pixelHue(pixel){
        var max = Math.max(pixel[0], pixel[1], pixel[2]);
        var min = Math.min(pixel[0], pixel[1], pixel[2]);
        var diff = max - min;
        //white, black or gray
        if(diff === 0){
            if(pixel[0] >= 128){
                return 360;
            }
            return 0;
        }
        let rawHue;
        if(pixel[R_INDEX] === max){
            rawHue = (pixel[G_INDEX] - pixel[B_INDEX]) / diff % 6;
        }
        else if(pixel[G_INDEX] === max){
            rawHue = (pixel[B_INDEX] - pixel[R_INDEX]) / diff + 2;
        }
        else{
            rawHue = (pixel[R_INDEX] - pixel[G_INDEX]) / diff + 4;
        }
        //convert to 360 degrees
        return rawHue * 60;
    }
    
    /**
     * based on https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * converts a hue in range 0-360 (saturation at 1 and lightness at 0.5) to an rgb Pixel
     *
     */
    function hueToPixel(hue){
        hue /= 360;
        var s = 1;
        var l = 0.5;
        var r, g, b;
    
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0){
                t += 1;   
            }
            else if(t > 1){
                t -= 1;   
            }
            if(t < 1/6){ 
                return p + (q - p) * 6 * t;
            }
            if(t < 1/2){
                return q;
            }
            if(t < 2/3){
                return p + (q - p) * (2/3 - t) * 6;
            }
            return p;
        };
    
        var q = l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, hue + 1/3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1/3);
        
        return Pixel.create(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    
    return {
       lightness: pixelLightness,
       hue: pixelHue,
       hueToPixel: hueToPixel,
    };
})(App.Pixel);