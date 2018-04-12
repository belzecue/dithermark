App.ColorQuantizationModes = [
    {key: 'SPATIAL_POPULARITY', title: 'Spatial Popularity (Horizontal)', algo: 'popularity'},
    {key: 'PERCEPTUAL_SPATIAL_POPULARITY', title: 'Perceptual Spatial Popularity (Horizontal)', algo: 'popularity'},
    {key: 'SPATIAL_POPULARITY_VERTICAL', title: 'Spatial Popularity (Vertical)', algo: 'popularity'},
    {key: 'PERCEPTUAL_SPATIAL_POPULARITY_VERTICAL', title: 'Perceptual Spatial Popularity (Vertical)', algo: 'popularity'},
    {key: 'LIGHTNESS_POPULARITY', title: 'Lightness Popularity', algo: 'lightnessPopularity'},
    {key: 'PERCEPTUAL_LIGHTNESS_POPULARITY', title: 'Perceptual Lightness Popularity', algo: 'lightnessPopularity'},
    {key: 'UNIFORM', title: 'Perceptual Uniform', algo: 'uniform'},
    {key: 'UNIFORM_VIBRANT', title: 'Perceptual Uniform (Vibrant)', algo: 'uniform'},
    {key: 'PMC_BALANCED', title: 'Perceptual Median Cut (Balanced)', algo: 'perceptualMedianCut', hueMix: 1.6},
    {key: 'PMC_MEDIAN', title: 'Perceptual Median Cut (Monotone)', algo: 'perceptualMedianCut', hueMix: 2.0},
    {key: 'PMC_UNIFORM_VIBRANT', title: 'Perceptual Median Cut (Uniform Vibrant)', algo: 'perceptualMedianCut', hueMix: 0.6},
    {key: 'PMC_UNIFORM', title: 'Perceptual Median Cut (Uniform)', algo: 'perceptualMedianCut', hueMix: 0.6},
    {key: 'MEDIAN_CUT', title: 'Median Cut', algo: 'medianCut'},
];