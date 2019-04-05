const { override, fixBabelImports, addLessLoader } = require("customize-cra");

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@primary-color": "#1890ff",

      //layout
      "@layout-body-background": "#ebf2fb",
      "@layout-header-background": "#0d102c"
    }
  })
);
