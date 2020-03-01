import { Selector, ClientFunction } from "testcafe"; // first import testcafe selectors
import XLSX from "xlsx";

fixture`Getting Started`
  .page // declare the fixture
`https://www.ipa.gov.pg/pngmaster/service/create.html?targetAppCode=pngmaster&targetRegisterAppCode=pngcompanies&service=registerItemSearch&target=pngmaster`; // specify the start page

const getInfo = ClientFunction(() => {
  let data = [];
  const dataRows = document.querySelectorAll(".appRepeaterRowContent");

  dataRows.forEach(domRowContent => {
    const appBadge = domRowContent.querySelector(".appBadge").textContent;
    const appReceiveFocus = domRowContent.querySelector(".appReceiveFocus")
      .textContent;

    let indexName = appReceiveFocus.lastIndexOf("(");
    let companyName = appReceiveFocus.slice(0, indexName).trim();
    let companyId = appReceiveFocus.slice(indexName).slice(1, -1);

    const address = domRowContent.querySelector(".appAttrValue").textContent;

    const addressArray = address.split(",");
    const province = addressArray[addressArray.length - 2] || "";
    const district = addressArray[addressArray.length - 3] || "";

    const status = domRowContent.querySelector(
      ".appMinimalAttr.Status .appMinimalValue"
    ).textContent;

    const registerDateEl = domRowContent.querySelector(
      ".appMinimalAttr.RegistrationDate .appMinimalValue"
    );

    const registerDate = registerDateEl ? registerDateEl.textContent : "";

    const businessCodeEl = domRowContent.querySelector(
      ".appMinimalAttr.BusinessSectorCode .appMinimalValue"
    );
    const businessCode = businessCodeEl ? businessCodeEl.textContent : "";

    const discriminantEl = domRowContent.querySelector(
      ".appMinimalAttr.Discriminant .appMinimalValue"
    );

    const discriminant = discriminantEl ? discriminantEl.textContent : "";

    data.push([
      companyId,
      companyName,
      appBadge,
      address,
      district,
      province,
      status,
      registerDate,
      businessCode,
      discriminant
    ]);
  });

  return data;
});

//then create a test and place your code there
test("My first test", async t => {
  await t.debug().setNativeDialogHandler(() => true);
  await t.wait(30000);

  let data = [];
  for (let i = 0; i < 1904; i++) {
    const dataRow = await getInfo();
    data = data.concat(dataRow);

    if ((i + 1) % 10 === 0 || i + 1 === 1904) {
      const name = `data_${i + 1}.xlsx`;
      await writeFile(data, name);
      data = [];
    }

    await t.wait(5000);
    await t.click(".appPagerContainerHeader .appNext.appNextEnabled");
    await t.wait(20000);
  }

  //   await t.wait(30000);
  //   getInfo();
  //   await t.click(".appPagerContainerHeader .appNext.appNextEnabled");
  //   await t.wait(30000);
  //   getInfo();
  await t.expect(0).eql(0);
});

const writeFile = async (data, name) => {
  let wb = XLSX.utils.book_new();
  let ws_name = "SheetJS";
  let ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  await XLSX.writeFile(wb, name);
};
