// Test script for export functionality
async function testExport() {
  try {
    console.log('Testing export endpoints...\n');
    
    // Test 1: City data CSV export
    console.log('1. Testing city data CSV export...');
    const cityCsvResponse = await fetch('http://localhost:5000/api/export/city?city=Delhi&state=Delhi&format=csv');
    const cityCsvData = await cityCsvResponse.text();
    console.log('City CSV Response Status:', cityCsvResponse.status);
    console.log('First 200 chars of CSV data:');
    console.log(cityCsvData.substring(0, 200));
    console.log('---\n');
    
    // Test 2: City data JSON export
    console.log('2. Testing city data JSON export...');
    const cityJsonResponse = await fetch('http://localhost:5000/api/export/city?city=Delhi&state=Delhi&format=json');
    const cityJsonData = await cityJsonResponse.json();
    console.log('City JSON Response Status:', cityJsonResponse.status);
    console.log('JSON data keys:', Object.keys(cityJsonData));
    console.log('---\n');
    
    // Test 3: Heatmap data CSV export
    console.log('3. Testing heatmap data CSV export...');
    const heatmapCsvResponse = await fetch('http://localhost:5000/api/export/heatmap?format=csv');
    const heatmapCsvData = await heatmapCsvResponse.text();
    console.log('Heatmap CSV Response Status:', heatmapCsvResponse.status);
    console.log('First 200 chars of heatmap CSV:');
    console.log(heatmapCsvData.substring(0, 200));
    console.log('---\n');
    
    // Test 4: Heatmap data JSON export
    console.log('4. Testing heatmap data JSON export...');
    const heatmapJsonResponse = await fetch('http://localhost:5000/api/export/heatmap?format=json');
    const heatmapJsonData = await heatmapJsonResponse.json();
    console.log('Heatmap JSON Response Status:', heatmapJsonResponse.status);
    console.log('Heatmap JSON data keys:', Object.keys(heatmapJsonData));
    console.log('Number of points:', heatmapJsonData.data?.points?.length || 0);
    console.log('---\n');
    
    console.log('✅ All export tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExport();