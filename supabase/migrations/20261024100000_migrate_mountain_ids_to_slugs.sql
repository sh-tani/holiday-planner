-- Convert mountain UUID IDs to the finalized slug IDs from mountain_id_mapping.csv.
-- Review and test locally before applying to production.
-- This migration intentionally changes only mountains.id and the five mountain_id FK columns.

CREATE TEMP TABLE mountain_id_mapping (
  old_id uuid PRIMARY KEY,
  new_id text NOT NULL UNIQUE
) ON COMMIT PRESERVE ROWS;

INSERT INTO mountain_id_mapping (old_id, new_id) VALUES
  ('c04f84c4-f742-4a57-806e-7eee2d55597c'::uuid, 'odo-mie'),
  ('87adf229-ad11-4d8c-b87f-c6e2245afadf'::uuid, 'konotomari-mie'),
  ('872fd8b5-2587-494e-a3f3-f1d67e8101e6'::uuid, 'ami-mie'),
  ('15d68566-9881-4f3e-ae7a-4f70edac2e26'::uuid, 'tsubone-mie'),
  ('e67d3dcb-de60-4603-9c59-5c7930ca92a3'::uuid, 'hinokizuka-mie'),
  ('bf5c34a5-abfb-4f61-ae58-9697bea49c7b'::uuid, 'mayoi-mie'),
  ('e064f501-33f9-44af-b646-0bcc2f298147'::uuid, 'gakunodo-mie'),
  ('2c8bd521-8c9a-492a-a7b0-fe880ac2c968'::uuid, 'ichigao-kyoto'),
  ('ba5fd750-fdb5-41e8-8628-e5e112b3db16'::uuid, 'ooe-kyoto'),
  ('b9d6be95-b426-48f5-9e4a-05fca0c4a31a'::uuid, 'misen-kyoto'),
  ('2c9608c3-c0d9-4107-9f46-d2f28bfa220b'::uuid, 'atago-kyoto'),
  ('6103587f-3e31-46f6-9eef-775a15c130c4'::uuid, 'sajiki-kyoto'),
  ('abd6ab2c-132f-4254-a452-7277d3a91e8e'::uuid, 'yura-kyoto'),
  ('7ae534f8-732e-47b0-bd81-6d0312d31651'::uuid, 'choro-kyoto'),
  ('b4425c64-7798-4313-9258-3bc30242d743'::uuid, 'kumotori-kyoto'),
  ('c0d27c9a-9fc2-4e37-979e-7e082eb98c5f'::uuid, 'hiei-kyoto'),
  ('da53d1af-56cb-4837-9eb6-21b4acc461d2'::uuid, 'minago-kyoto'),
  ('ecb65902-f9b7-4316-b041-3ea515832476'::uuid, 'hachigamine-kyoto'),
  ('58c21586-b26b-4f1e-b963-bed5ad223802'::uuid, 'nagusa-hyogo'),
  ('269f97a0-b9ed-4067-8405-6bc9be00a9ed'::uuid, 'mi-hyogo'),
  ('ca5d62a6-6ee4-492b-9b3b-2842bf2272bf'::uuid, 'rokko-hyogo'),
  ('c577c68d-3aac-46e9-9549-30915c496f22'::uuid, 'sengamine-hyogo'),
  ('c92d7bd4-2a92-410d-8b22-05e975487280'::uuid, 'taishaku-hyogo'),
  ('9a83abc2-9acb-4585-a4fd-a74b34988442'::uuid, 'maya-hyogo'),
  ('8117f6b2-64b3-47dd-8740-f293d005f376'::uuid, 'higashitokoro-hyogo'),
  ('8c347b5a-0e18-46a6-9e22-89fb3d545abb'::uuid, 'yokoo-hyogo'),
  ('0c5cf9a9-d83e-41df-9b7d-d6fde64ff729'::uuid, 'dangamine-hyogo'),
  ('6ee696e3-607a-43e1-9c3e-c0699e8854d4'::uuid, 'shiraga-hyogo'),
  ('54e7c523-973a-4325-bab2-fefcd19d7a26'::uuid, 'kasagata-hyogo'),
  ('46e90c11-d894-4efc-beaf-8b6c9f01e933'::uuid, 'sobu-hyogo'),
  ('493aa4b2-6453-4442-8fa7-568bd1328876'::uuid, 'yuzuruha-hyogo'),
  ('725504fb-0ad7-4482-b7f0-1e608e97e9c7'::uuid, 'hachibuse-hyogo'),
  ('e79bc5f4-b475-4627-9c3a-2f4d416802b5'::uuid, 'seppiko-hyogo'),
  ('79a6b8ca-a1fa-4656-985a-761d54c2b469'::uuid, 'takamikura-hyogo'),
  ('31969fd4-225c-4f72-8fbd-ee1169495475'::uuid, 'ushiro-hyogo'),
  ('9082455f-afe1-49dc-b598-3aca0797f434'::uuid, 'hinakura-hyogo'),
  ('474140ab-982e-4529-acb1-421934ab394e'::uuid, 'mimuro-hyogo'),
  ('b3df3563-0eea-47af-95e4-5535546efaa5'::uuid, 'hyono-hyogo'),
  ('a140bbc9-4acc-4286-85c9-7a50b4710148'::uuid, 'tomuraushi-hokkaido'),
  ('6566a853-5cc6-43b9-b72a-e41439eabc52'::uuid, 'rishiri-hokkaido'),
  ('d8bff22d-707e-42d9-a7eb-9d4e7e62985e'::uuid, 'tokachi-hokkaido'),
  ('57d63f97-917b-4747-914c-fab3ab479a75'::uuid, 'taisetsu-hokkaido'),
  ('a3e0a714-a739-4fb5-80da-d6323e4c745c'::uuid, 'poroshiri-hokkaido'),
  ('e6e3d682-678c-4374-b7f6-150e29785917'::uuid, 'shiribeshi-hokkaido'),
  ('0ddb6ffe-9004-4f5e-aca0-413712dc37c0'::uuid, 'shari-hokkaido'),
  ('76e76dda-c850-43b4-801f-d1f420bd879d'::uuid, 'rausu-hokkaido'),
  ('4671746e-aa7a-4761-bd84-fd11e7d64b65'::uuid, 'akan-hokkaido'),
  ('82d2097d-1a7a-4973-b6f8-b6e6d68208f8'::uuid, 'godaison-wakayama'),
  ('69842bbb-3e3f-48e4-a195-602c28609a63'::uuid, 'hanzorei-wakayama'),
  ('49b8d02c-c960-4756-9eed-1895fd612d42'::uuid, 'oto-wakayama'),
  ('307f15de-4509-4d5e-8a00-622e2060116c'::uuid, 'dakenomori-wakayama'),
  ('179bd478-f01b-4927-b0a6-7a6e8bf7d9d5'::uuid, 'yoryu-wakayama'),
  ('36963f55-4bf2-4757-b661-4dab272abadb'::uuid, 'hoshi-wakayama'),
  ('5036a511-e618-454c-baaa-a43a438ace7e'::uuid, 'eboshi-wakayama'),
  ('6a1e7472-61f7-428f-bbc3-9ea552242405'::uuid, 'oishigamine-wakayama'),
  ('fcfb729e-ebc6-48ab-ba6c-4e8f8b39dfa8'::uuid, 'yahazu-wakayama'),
  ('1f0d17d4-18cf-47c9-90f6-84a124e5519d'::uuid, 'ryumon-wakayama'),
  ('fd11277f-586f-4509-999c-94c0e4ed6aa0'::uuid, 'gomadan-wakayama'),
  ('53735ed0-fee6-48b2-87c2-40b1c0e837fe'::uuid, 'ryokami-saitama'),
  ('7995b061-bbed-40f3-bc1d-f01ef01fa678'::uuid, 'kumotori-saitama'),
  ('3426c517-b8b6-4abf-a8c6-9eecb00a1547'::uuid, 'kobushi-saitama'),
  ('07321d61-4db9-466d-8436-5174a3b46906'::uuid, 'kuju-oita'),
  ('60175726-e4f0-42c8-b879-eb69de2b1548'::uuid, 'sobo-oita'),
  ('056246b2-ca3a-4eac-9570-9ba85eb68617'::uuid, 'kenbi-osaka'),
  ('2917cd11-69f5-453e-ab07-80bdaddd24d3'::uuid, 'iwawaki-osaka'),
  ('236264a9-d771-4d75-afea-fe73b1fda82e'::uuid, 'ponpon-osaka'),
  ('6bc04d2f-1edb-4794-afd0-f0667dc7cded'::uuid, 'myoken-osaka'),
  ('a86ac3bf-d954-44fe-8b43-dc424e021192'::uuid, 'izumikatsuragi-osaka'),
  ('a82a756a-d91c-46df-a91b-7ebfec9ef539'::uuid, 'nijo-osaka'),
  ('cc9fcabb-72b9-4617-81ec-0df020e7549a'::uuid, 'yamatokatsuragi-osaka'),
  ('70aaaecd-9bce-4ed9-abd7-45ceddefb9e6'::uuid, 'ikoma-osaka'),
  ('717f1cc4-d3a5-474f-a415-6e546520e70e'::uuid, 'kongo-osaka'),
  ('e6aebb59-707c-4e66-9c7c-9d23db4674ee'::uuid, 'miwa-nara'),
  ('e49c0191-aa22-4e06-8569-ef20f97a3c36'::uuid, 'obako-nara'),
  ('ecfcf473-9530-4a40-95ca-2d283f466c3e'::uuid, 'suzuka-nara'),
  ('c8872a10-a2ff-4c0d-a847-dfdca4b6e672'::uuid, 'kabuto-nara'),
  ('741e3ad7-a043-4e27-a40d-510fbc48bf4e'::uuid, 'hiyamizu-nara'),
  ('4b358278-9f8a-46dd-ae8a-779d07d93f62'::uuid, 'kogou-nara'),
  ('fcbf42fd-8a64-483d-a394-2b747b04dcba'::uuid, 'yoshino-nara'),
  ('63ee468d-abda-4532-ba9d-437c41f937eb'::uuid, 'omine-nara'),
  ('49a96288-a3c5-4980-91e9-172d75d96428'::uuid, 'daifugen-nara'),
  ('25f8475d-a21b-4b4a-8e4e-94d76196c820'::uuid, 'sanjo-nara'),
  ('e3126639-4900-4441-912a-67bf88c02473'::uuid, 'tamaki-nara'),
  ('1ca21b64-b2d4-4ada-b0e3-1080d7527fed'::uuid, 'inamura-nara'),
  ('5a0b61b8-7aa3-4ab2-a224-25c11f46dc52'::uuid, 'kasasute-nara'),
  ('3925ced0-8682-4677-ac92-0dad61746cc4'::uuid, 'gyojagaeri-nara'),
  ('975cb2b3-f582-4441-a80e-fdb3db1183a8'::uuid, 'shaka-nara'),
  ('a13ed6cc-cb1e-4758-8f3a-64cf12e466a1'::uuid, 'yoroi-nara'),
  ('a77c1560-a301-4d00-aa02-92025fe3bc14'::uuid, 'otowa-nara'),
  ('434ee631-c2d8-4d96-85de-a59afb3b90bb'::uuid, 'nukai-nara'),
  ('c9f3bdb8-7466-4f44-97d2-cb0fb5d3db0e'::uuid, 'miune-nara'),
  ('7abd5ed7-f9b0-4336-998c-23666573778e'::uuid, 'kuruso-nara'),
  ('6e94d79e-f955-4c66-a512-fae90de4e70a'::uuid, 'odai-nara'),
  ('3fb55b4a-ddf4-47be-8b84-85a6a71796bd'::uuid, 'myojin-nara'),
  ('a5b712d8-0777-4aa1-a39f-05f1596a68a0'::uuid, 'ikegoya-nara'),
  ('ee8e1f45-8fdd-48df-b6e2-0d5f0633c42c'::uuid, 'takami-nara'),
  ('06b3eab6-273c-463a-9b39-9b3658c72fdb'::uuid, 'zao-miyagi'),
  ('d912222a-f1d9-4932-a5b1-a04ccb031810'::uuid, 'kirishima-miyazaki'),
  ('db1a71c5-0ae1-4027-9a52-7acb260b5023'::uuid, 'tsurugi-toyama'),
  ('bcab52e1-ab2c-4598-9cd9-dcee79cf941b'::uuid, 'suisho-toyama'),
  ('6e4f32fd-ee48-496c-a7a2-1d8ef691aec8'::uuid, 'tate-toyama'),
  ('a723fca8-8efd-427c-ad4b-f25587f9ff4e'::uuid, 'yakushi-toyama'),
  ('4bcb8845-1aee-4c7f-b266-118c9a945e3d'::uuid, 'kurobegoro-toyama'),
  ('65136b46-61ac-4620-bb86-08e894a52a38'::uuid, 'gassan-yamagata'),
  ('2d5e7f9e-30f1-4009-b2d3-3d6a5f1d9c81'::uuid, 'asahi-yamagata'),
  ('5a6f777c-11e2-411a-9446-4012b028f749'::uuid, 'iide-yamagata'),
  ('6ebf1ba4-d3e1-4f59-8299-ed034c7bcb3b'::uuid, 'kita-yamanashi'),
  ('ebeb1754-aaf4-4b8c-81b6-80a44dd302b9'::uuid, 'daibosatsu-yamanashi'),
  ('fd883c91-e822-4b44-bdd8-2e3aa499e9ce'::uuid, 'mizugaki-yamanashi'),
  ('ad9fac74-fd0f-466b-b635-d2a0e997eed2'::uuid, 'houou-yamanashi'),
  ('9e416657-3600-45ee-b076-08fdd205572c'::uuid, 'kaikoma-yamanashi'),
  ('03ea2594-15f5-42ed-88be-33dc451b0820'::uuid, 'fuji-yamanashi'),
  ('a98c25b7-96f9-46aa-872d-5b08aece2db2'::uuid, 'aino-yamanashi'),
  ('fff3ca00-8eae-4a8d-a297-52315a75e17d'::uuid, 'kasa-gifu'),
  ('e08a5f5c-ca84-484d-ba25-4d5f42daaa36'::uuid, 'kanakuso-gifu'),
  ('30b430ea-7549-45e3-9393-1e298baaaa4d'::uuid, 'iwate-iwate'),
  ('aa3e5236-2f0d-4aec-97bc-d56c704eb419'::uuid, 'hayachine-iwate'),
  ('d1a99bb1-6f84-4484-871e-0f2ade3e812b'::uuid, 'hachimantai-iwate'),
  ('0597a685-23ea-4fe9-a62e-9f330b735899'::uuid, 'tsurugi-tokushima'),
  ('37519948-1a6d-40ef-ba34-dce8b0ba0dd0'::uuid, 'ishizuchi-ehime'),
  ('9e38c830-cc88-41e6-b686-ebcba0054c8b'::uuid, 'myoko-niigata'),
  ('e57bc9ec-4336-4a50-a645-4485f0288d70'::uuid, 'hiuchi-niigata'),
  ('095ea9f4-09c8-4715-b156-c8b87c950c32'::uuid, 'echigokoma-niigata'),
  ('3d4ee299-f6ff-4787-9cd2-0e1a3fca4f41'::uuid, 'makihata-niigata'),
  ('6b4f0c31-9170-4828-aee0-576bb642aa2b'::uuid, 'hiraga-niigata'),
  ('ff8792d9-2ad3-49c3-ac5f-8aa096239542'::uuid, 'tanigawa-niigata'),
  ('17e58a08-2412-4bed-82d3-fc8869cbdcb9'::uuid, 'naeba-niigata'),
  ('9acc4ab4-4ccd-4f42-8844-b902f761367d'::uuid, 'amakazari-niigata'),
  ('2de5b7ef-9535-429a-8a5a-72f305f3e97c'::uuid, 'takatsuma-niigata'),
  ('e9385fbb-4528-4ba9-b14f-cad4165d31da'::uuid, 'takao-tokyo'),
  ('c7ba1f28-b241-4d9d-9462-acdf9fc418ea'::uuid, 'nantai-tochigi'),
  ('413b2754-69c4-4750-b8c5-f49b4def2e21'::uuid, 'sukai-tochigi'),
  ('4a3341b2-aef2-4c2e-ac86-172dd23d7e10'::uuid, 'nanazuga-shiga'),
  ('e2c9870d-67ee-470d-b77c-bdf5089b10c8'::uuid, 'mikami-shiga'),
  ('45da7445-5a7c-48a3-927d-34b8e3bc2735'::uuid, 'ibuki-shiga'),
  ('02104e46-6716-40a0-a2ea-034f3b13a7d4'::uuid, 'tanakami-shiga'),
  ('2b8ba725-600c-4e0b-bea2-f60ecd687af7'::uuid, 'oike-shiga'),
  ('6785105b-60ae-41bc-a256-164914f4e86a'::uuid, 'yoko-shiga'),
  ('5d5f7b52-8a9b-42c7-b049-1f1f0a709913'::uuid, 'buna-shiga'),
  ('e2858bf0-4288-4dde-b297-c5162f7f9ab1'::uuid, 'horai-shiga'),
  ('11074f00-d3ab-4393-9860-0871af79591b'::uuid, 'jatanigamine-shiga'),
  ('72bd9dab-cb97-4cc9-8d3f-a7b08df9f073'::uuid, 'shizu-shiga'),
  ('8cc531c7-b25a-4572-aa61-4fb4ead06228'::uuid, 'ryozen-shiga'),
  ('2135179e-9fcd-43dc-94cf-148af77f8771'::uuid, 'gozaisho-shiga'),
  ('23ed2aad-282a-4798-9d2d-3bc039c1f180'::uuid, 'fujiwara-shiga'),
  ('0699a7cc-caae-4a39-bc84-6cd3695a216a'::uuid, 'kama-shiga'),
  ('53b7d2c9-ddde-41ca-ad90-1b3e50ca7da3'::uuid, 'hyakuri-shiga'),
  ('8ee3ad77-bd78-4b14-aa3a-057b8e0ab230'::uuid, 'aso-kumamoto'),
  ('ffac0c50-f4a6-456b-9e32-aaf51c6a91ac'::uuid, 'haku-ishikawa'),
  ('7fc33f49-3381-44de-87d5-69130ae3ad51'::uuid, 'tanzawa-kanagawa'),
  ('81394fd0-68db-401f-9101-8b10d9d59c2a'::uuid, 'arashima-fukui'),
  ('d0ed2b5f-c3a6-4595-b50d-15e818888805'::uuid, 'nosaka-fukui'),
  ('4378b6ad-f57b-4b3e-b869-06706b648b00'::uuid, 'aoba-fukui'),
  ('6c98de93-2cc3-47a3-b0a6-6d9682ed3ae3'::uuid, 'sanjusangen-fukui'),
  ('b934afb6-55cd-46c3-8b56-2db57dd60c1f'::uuid, 'akasaka-fukui'),
  ('78d753a1-d258-4bd9-b6ec-4ae6b3d08caf'::uuid, 'aidukoma-fukushima'),
  ('723b7eaf-0c1f-406b-a367-11445b3ea10a'::uuid, 'adatara-fukushima'),
  ('cbb30028-8e47-42cd-bc47-a0afb9be994d'::uuid, 'hiuchi-fukushima'),
  ('3a44751a-ac07-4a88-bf77-628fc449a5ec'::uuid, 'bandai-fukushima'),
  ('76aa825d-6b23-4b46-adb0-ca0b2e1fb064'::uuid, 'azuma-fukushima'),
  ('4ef05c85-23da-4467-9f57-eb0a42fe9ec8'::uuid, 'nasu-fukushima'),
  ('03c23407-4c0f-426d-8602-760501999f58'::uuid, 'chokai-akita'),
  ('1de7b0f4-add2-4f24-88a0-d6b7e5b8034c'::uuid, 'hotaka-gunma'),
  ('b518d531-f896-4456-b5f3-0cf2336b0f49'::uuid, 'shibutsu-gunma'),
  ('d2b62e09-df28-459b-a3bc-c949ea589b53'::uuid, 'kusatsu-shirane-gunma'),
  ('3116d3ea-41a5-456b-acf3-679c06f48484'::uuid, 'akagi-gunma'),
  ('002521a3-e552-465f-9f4e-ee1513dbae8e'::uuid, 'nikko-shirane-gunma'),
  ('fb01fe42-e497-4d7e-8c91-374f33ab136a'::uuid, 'azumaya-gunma'),
  ('c562e0e7-3a82-4616-a673-087f8e874122'::uuid, 'asama-gunma'),
  ('476412ba-f101-4774-b42e-02a401305d54'::uuid, 'tsukuba-ibaraki'),
  ('600aeb8f-4aa5-4372-bf72-9e2a09dec9c1'::uuid, 'jonen-nagano'),
  ('289f8abb-23c7-4c8f-8f85-820455231480'::uuid, 'kisokoma-nagano'),
  ('3d63c784-2281-4e76-bdc1-aa37b2a7c911'::uuid, 'utsugi-nagano'),
  ('ba64328e-3de2-4521-9f77-7dae7dfb55b7'::uuid, 'utsukushigahara-nagano'),
  ('3e8b8bea-404f-4bff-84f2-e88e6ecc8f24'::uuid, 'tateshina-nagano'),
  ('c07734a8-c3a2-41df-af30-1f05a4a68070'::uuid, 'kirigamine-nagano'),
  ('62880401-49cf-468c-9aaf-b004c96fc2be'::uuid, 'goryu-nagano'),
  ('5694c9b9-80ca-4dee-88b1-dd430355a87c'::uuid, 'shirouma-nagano'),
  ('3c33087a-dc45-4eb7-b51f-ca70eb851b6d'::uuid, 'washiba-nagano'),
  ('f524e07e-0561-438a-ad15-1b6f93b0d945'::uuid, 'kashimayari-nagano'),
  ('0b0f9217-19be-431e-9268-cd51d4c46402'::uuid, 'senjo-nagano'),
  ('3c08026c-1fe4-4c28-88f4-14fc8a4f5c34'::uuid, 'yatsu-nagano'),
  ('27f14786-d677-404f-8c27-5bc5364b22ad'::uuid, 'kinpu-nagano'),
  ('152fe6c0-7b69-4dc4-a045-6f86bcf7569f'::uuid, 'norikura-nagano'),
  ('f0e12a44-e04b-475e-8316-1790b6cb3efc'::uuid, 'ontake-nagano'),
  ('7b5cbc8c-066a-4b06-9400-3e892cad4933'::uuid, 'ena-nagano'),
  ('f04bef3a-03c4-40b6-abe8-c9a37af60f7a'::uuid, 'yari-nagano'),
  ('1943db8d-fd18-47aa-92c3-7d8b04e85150'::uuid, 'yake-nagano'),
  ('6836b300-dd99-4442-8a2d-9e4b279c9393'::uuid, 'hotaka-nagano'),
  ('04a172c5-890b-4c36-b9d6-f03a7919fc47'::uuid, 'tekari-nagano'),
  ('2aec9706-7265-4b7f-8113-bc1d19c4ef29'::uuid, 'shiomi-nagano'),
  ('fb6fe52e-42e8-48cc-83ca-9270155836a6'::uuid, 'hijiri-nagano'),
  ('4a39942b-ad11-40e8-89a5-c6dd170fd2a3'::uuid, 'akaishi-nagano'),
  ('175ff948-bed2-4f90-91ce-0a04a9f14016'::uuid, 'hakkoda-aomori'),
  ('bd04eb05-d481-4d2f-a80a-c998ab994ade'::uuid, 'iwaki-aomori'),
  ('f1ccf14b-68d0-47d7-b17b-19bc11c6cf65'::uuid, 'amagi-shizuoka'),
  ('a0fc63ec-e8e1-4f6d-bf99-4c5bcfc513b5'::uuid, 'arakawa-shizuoka'),
  ('d6785235-ca5e-42e0-a974-43f23f7c19b2'::uuid, 'daisen-tottori'),
  ('c9d5b309-3659-45ee-84b9-a5c35ed0a268'::uuid, 'ogino-tottori'),
  ('a10f979b-d785-4627-a2c2-d885df03b840'::uuid, 'miyanoura-kagoshima'),
  ('d6c0aab4-10b3-4bff-b31b-83e263e12041'::uuid, 'kaimon-kagoshima');

DO $$
DECLARE
  mapping_count integer;
  mountain_count integer;
BEGIN
  SELECT count(*) INTO mapping_count FROM mountain_id_mapping;
  SELECT count(*) INTO mountain_count FROM public.mountains;

  IF mapping_count <> 201 THEN
    RAISE EXCEPTION 'Expected 201 mapping rows, found %', mapping_count;
  END IF;
  IF mountain_count <> mapping_count THEN
    RAISE EXCEPTION 'Mountain count (%) does not match mapping count (%)', mountain_count, mapping_count;
  END IF;
  IF EXISTS (
    SELECT 1 FROM mountain_id_mapping x
    LEFT JOIN public.mountains m ON m.id::text = x.old_id::text
    WHERE m.id IS NULL
  ) THEN
    RAISE EXCEPTION 'At least one mapping old_id is missing from public.mountains';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.mountains m
    LEFT JOIN mountain_id_mapping x ON x.old_id::text = m.id::text
    WHERE x.old_id IS NULL
  ) THEN
    RAISE EXCEPTION 'At least one public.mountains ID is missing from the mapping';
  END IF;
  IF EXISTS (
    SELECT 1 FROM mountain_id_mapping x
    JOIN public.mountains m ON m.id::text = x.old_id::text
    WHERE m.name IS DISTINCT FROM (
      CASE x.new_id
        WHEN 'odo-mie' THEN '大洞山'
        WHEN 'konotomari-mie' THEN '子ノ泊山'
        WHEN 'ami-mie' THEN '尼ヶ岳'
        WHEN 'tsubone-mie' THEN '局ヶ岳'
        WHEN 'hinokizuka-mie' THEN '桧塚'
        WHEN 'mayoi-mie' THEN '迷岳'
        WHEN 'gakunodo-mie' THEN '学能堂山'
        WHEN 'ichigao-kyoto' THEN '依遅ヶ尾山'
        WHEN 'ooe-kyoto' THEN '大江山'
        WHEN 'misen-kyoto' THEN '弥仙山'
        WHEN 'atago-kyoto' THEN '愛宕山'
        WHEN 'sajiki-kyoto' THEN '桟敷ヶ岳'
        WHEN 'yura-kyoto' THEN '由良ヶ岳'
        WHEN 'choro-kyoto' THEN '長老ヶ岳'
        WHEN 'kumotori-kyoto' THEN '雲取山'
        WHEN 'hiei-kyoto' THEN '比叡山'
        WHEN 'minago-kyoto' THEN '皆子山'
        WHEN 'hachigamine-kyoto' THEN '八ヶ峰'
        WHEN 'nagusa-hyogo' THEN '七種山'
        WHEN 'mi-hyogo' THEN '三嶽'
        WHEN 'rokko-hyogo' THEN '六甲山'
        WHEN 'sengamine-hyogo' THEN '千ヶ峰'
        WHEN 'taishaku-hyogo' THEN '帝釈山'
        WHEN 'maya-hyogo' THEN '摩耶山'
        WHEN 'higashitokoro-hyogo' THEN '東床尾山'
        WHEN 'yokoo-hyogo' THEN '横尾山'
        WHEN 'dangamine-hyogo' THEN '段ヶ峰'
        WHEN 'shiraga-hyogo' THEN '白髪岳'
        WHEN 'kasagata-hyogo' THEN '笠形山'
        WHEN 'sobu-hyogo' THEN '蘇武岳'
        WHEN 'yuzuruha-hyogo' THEN '諭鶴羽山'
        WHEN 'hachibuse-hyogo' THEN '鉢伏山'
        WHEN 'seppiko-hyogo' THEN '雪彦山'
        WHEN 'takamikura-hyogo' THEN '高御位山'
        WHEN 'ushiro-hyogo' THEN '後山'
        WHEN 'hinakura-hyogo' THEN '日名倉山'
        WHEN 'mimuro-hyogo' THEN '三室山'
        WHEN 'hyono-hyogo' THEN '氷ノ山'
        WHEN 'tomuraushi-hokkaido' THEN 'トムラウシ山'
        WHEN 'rishiri-hokkaido' THEN '利尻山'
        WHEN 'tokachi-hokkaido' THEN '十勝岳'
        WHEN 'taisetsu-hokkaido' THEN '大雪山'
        WHEN 'poroshiri-hokkaido' THEN '幌尻岳'
        WHEN 'shiribeshi-hokkaido' THEN '後方羊蹄山'
        WHEN 'shari-hokkaido' THEN '斜里岳'
        WHEN 'rausu-hokkaido' THEN '羅臼岳'
        WHEN 'akan-hokkaido' THEN '阿寒岳'
        WHEN 'godaison-wakayama' THEN '五大尊岳'
        WHEN 'hanzorei-wakayama' THEN '半作嶺'
        WHEN 'oto-wakayama' THEN '大塔山'
        WHEN 'dakenomori-wakayama' THEN '嶽ノ森山'
        WHEN 'yoryu-wakayama' THEN '楊柳山'
        WHEN 'hoshi-wakayama' THEN '法師山'
        WHEN 'eboshi-wakayama' THEN '烏帽子山'
        WHEN 'oishigamine-wakayama' THEN '生石ヶ峰'
        WHEN 'yahazu-wakayama' THEN '矢筈岳'
        WHEN 'ryumon-wakayama' THEN '龍門山'
        WHEN 'gomadan-wakayama' THEN '護摩壇山'
        WHEN 'ryokami-saitama' THEN '両神山'
        WHEN 'kumotori-saitama' THEN '雲取山'
        WHEN 'kobushi-saitama' THEN '甲武信ヶ岳'
        WHEN 'kuju-oita' THEN '九重山'
        WHEN 'sobo-oita' THEN '祖母山'
        WHEN 'kenbi-osaka' THEN '剣尾山'
        WHEN 'iwawaki-osaka' THEN '岩湧山'
        WHEN 'ponpon-osaka' THEN 'ポンポン山'
        WHEN 'myoken-osaka' THEN '妙見山'
        WHEN 'izumikatsuragi-osaka' THEN '和泉葛城山'
        WHEN 'nijo-osaka' THEN '二上山'
        WHEN 'yamatokatsuragi-osaka' THEN '大和葛城山'
        WHEN 'ikoma-osaka' THEN '生駒山'
        WHEN 'kongo-osaka' THEN '金剛山'
        WHEN 'miwa-nara' THEN '三輪山'
        WHEN 'obako-nara' THEN '伯母子岳'
        WHEN 'suzuka-nara' THEN '住塚山'
        WHEN 'kabuto-nara' THEN '兜岳'
        WHEN 'hiyamizu-nara' THEN '冷水山'
        WHEN 'kogou-nara' THEN '古光山'
        WHEN 'yoshino-nara' THEN '吉野山'
        WHEN 'omine-nara' THEN '大峰山'
        WHEN 'daifugen-nara' THEN '大普賢岳'
        WHEN 'sanjo-nara' THEN '山上ヶ岳'
        WHEN 'tamaki-nara' THEN '玉置山'
        WHEN 'inamura-nara' THEN '稲村ヶ岳'
        WHEN 'kasasute-nara' THEN '笠捨山'
        WHEN 'gyojagaeri-nara' THEN '行者還岳'
        WHEN 'shaka-nara' THEN '釈迦ヶ岳'
        WHEN 'yoroi-nara' THEN '鎧岳'
        WHEN 'otowa-nara' THEN '音羽山'
        WHEN 'nukai-nara' THEN '額井岳'
        WHEN 'miune-nara' THEN '三峰山'
        WHEN 'kuruso-nara' THEN '倶留尊山'
        WHEN 'odai-nara' THEN '大台ヶ原山'
        WHEN 'myojin-nara' THEN '明神岳'
        WHEN 'ikegoya-nara' THEN '池木屋山'
        WHEN 'takami-nara' THEN '高見山'
        WHEN 'zao-miyagi' THEN '蔵王山'
        WHEN 'kirishima-miyazaki' THEN '霧島山'
        WHEN 'tsurugi-toyama' THEN '剱岳'
        WHEN 'suisho-toyama' THEN '水晶岳'
        WHEN 'tate-toyama' THEN '立山'
        WHEN 'yakushi-toyama' THEN '薬師岳'
        WHEN 'kurobegoro-toyama' THEN '黒部五郎岳'
        WHEN 'gassan-yamagata' THEN '月山'
        WHEN 'asahi-yamagata' THEN '朝日岳'
        WHEN 'iide-yamagata' THEN '飯豊山'
        WHEN 'kita-yamanashi' THEN '北岳'
        WHEN 'daibosatsu-yamanashi' THEN '大菩薩嶺'
        WHEN 'mizugaki-yamanashi' THEN '瑞牆山'
        WHEN 'houou-yamanashi' THEN '鳳凰山'
        WHEN 'kaikoma-yamanashi' THEN '甲斐駒ヶ岳'
        WHEN 'fuji-yamanashi' THEN '富士山'
        WHEN 'aino-yamanashi' THEN '間ノ岳'
        WHEN 'kasa-gifu' THEN '笠ヶ岳'
        WHEN 'kanakuso-gifu' THEN '金糞岳'
        WHEN 'iwate-iwate' THEN '岩手山'
        WHEN 'hayachine-iwate' THEN '早池峰山'
        WHEN 'hachimantai-iwate' THEN '八幡平'
        WHEN 'tsurugi-tokushima' THEN '剣山'
        WHEN 'ishizuchi-ehime' THEN '石鎚山'
        WHEN 'myoko-niigata' THEN '妙高山'
        WHEN 'hiuchi-niigata' THEN '火打山'
        WHEN 'echigokoma-niigata' THEN '越後駒ヶ岳'
        WHEN 'makihata-niigata' THEN '巻機山'
        WHEN 'hiraga-niigata' THEN '平ヶ岳'
        WHEN 'tanigawa-niigata' THEN '谷川岳'
        WHEN 'naeba-niigata' THEN '苗場山'
        WHEN 'amakazari-niigata' THEN '雨飾山'
        WHEN 'takatsuma-niigata' THEN '高妻山'
        WHEN 'takao-tokyo' THEN '高尾山'
        WHEN 'nantai-tochigi' THEN '男体山'
        WHEN 'sukai-tochigi' THEN '皇海山'
        WHEN 'nanazuga-shiga' THEN '七七頭ヶ岳'
        WHEN 'mikami-shiga' THEN '三上山'
        WHEN 'ibuki-shiga' THEN '伊吹山'
        WHEN 'tanakami-shiga' THEN '太神山'
        WHEN 'oike-shiga' THEN '御池岳'
        WHEN 'yoko-shiga' THEN '横山岳'
        WHEN 'buna-shiga' THEN '武奈ヶ岳'
        WHEN 'horai-shiga' THEN '蓬莱山'
        WHEN 'jatanigamine-shiga' THEN '蛇谷ヶ峰'
        WHEN 'shizu-shiga' THEN '賤ヶ岳'
        WHEN 'ryozen-shiga' THEN '霊仙山'
        WHEN 'gozaisho-shiga' THEN '御在所岳'
        WHEN 'fujiwara-shiga' THEN '藤原岳'
        WHEN 'kama-shiga' THEN '鎌ヶ岳'
        WHEN 'hyakuri-shiga' THEN '百里ヶ岳'
        WHEN 'aso-kumamoto' THEN '阿蘇山'
        WHEN 'haku-ishikawa' THEN '白山'
        WHEN 'tanzawa-kanagawa' THEN '丹沢山'
        WHEN 'arashima-fukui' THEN '荒島岳'
        WHEN 'nosaka-fukui' THEN '野坂岳'
        WHEN 'aoba-fukui' THEN '青葉山'
        WHEN 'sanjusangen-fukui' THEN '三十三間山'
        WHEN 'akasaka-fukui' THEN '赤坂山'
        WHEN 'aidukoma-fukushima' THEN '会津駒ヶ岳'
        WHEN 'adatara-fukushima' THEN '安達太良山'
        WHEN 'hiuchi-fukushima' THEN '燧ヶ岳'
        WHEN 'bandai-fukushima' THEN '磐梯山'
        WHEN 'azuma-fukushima' THEN '吾妻山'
        WHEN 'nasu-fukushima' THEN '那須岳'
        WHEN 'chokai-akita' THEN '鳥海山'
        WHEN 'hotaka-gunma' THEN '武尊山'
        WHEN 'shibutsu-gunma' THEN '至仏山'
        WHEN 'kusatsu-shirane-gunma' THEN '草津白根山'
        WHEN 'akagi-gunma' THEN '赤城山'
        WHEN 'nikko-shirane-gunma' THEN '日光白根山'
        WHEN 'azumaya-gunma' THEN '四阿山'
        WHEN 'asama-gunma' THEN '浅間山'
        WHEN 'tsukuba-ibaraki' THEN '筑波山'
        WHEN 'jonen-nagano' THEN '常念岳'
        WHEN 'kisokoma-nagano' THEN '木曽駒ヶ岳'
        WHEN 'utsugi-nagano' THEN '空木岳'
        WHEN 'utsukushigahara-nagano' THEN '美ヶ原'
        WHEN 'tateshina-nagano' THEN '蓼科山'
        WHEN 'kirigamine-nagano' THEN '霧ヶ峰'
        WHEN 'goryu-nagano' THEN '五竜岳'
        WHEN 'shirouma-nagano' THEN '白馬岳'
        WHEN 'washiba-nagano' THEN '鷲羽岳'
        WHEN 'kashimayari-nagano' THEN '鹿島槍ヶ岳'
        WHEN 'senjo-nagano' THEN '仙丈ヶ岳'
        WHEN 'yatsu-nagano' THEN '八ヶ岳'
        WHEN 'kinpu-nagano' THEN '金峰山'
        WHEN 'norikura-nagano' THEN '乗鞍岳'
        WHEN 'ontake-nagano' THEN '御嶽山'
        WHEN 'ena-nagano' THEN '恵那山'
        WHEN 'yari-nagano' THEN '槍ヶ岳'
        WHEN 'yake-nagano' THEN '焼岳'
        WHEN 'hotaka-nagano' THEN '穂高岳'
        WHEN 'tekari-nagano' THEN '光岳'
        WHEN 'shiomi-nagano' THEN '塩見岳'
        WHEN 'hijiri-nagano' THEN '聖岳'
        WHEN 'akaishi-nagano' THEN '赤石岳'
        WHEN 'hakkoda-aomori' THEN '八甲田山'
        WHEN 'iwaki-aomori' THEN '岩木山'
        WHEN 'amagi-shizuoka' THEN '天城山'
        WHEN 'arakawa-shizuoka' THEN '荒川岳'
        WHEN 'daisen-tottori' THEN '大山'
        WHEN 'ogino-tottori' THEN '扇ノ山'
        WHEN 'miyanoura-kagoshima' THEN '宮之浦岳'
        WHEN 'kaimon-kagoshima' THEN '開聞岳'
        ELSE NULL
      END
    )
  ) THEN
    RAISE EXCEPTION 'A mapping row has a mountain name mismatch';
  END IF;

  IF EXISTS (SELECT 1 FROM public.mountain_list_members c LEFT JOIN mountain_id_mapping x ON c.mountain_id::text = x.old_id::text WHERE x.old_id IS NULL) THEN
    RAISE EXCEPTION 'Unmapped mountain_id found in mountain_list_members';
  END IF;
  IF EXISTS (SELECT 1 FROM public.schedule c LEFT JOIN mountain_id_mapping x ON c.mountain_id::text = x.old_id::text WHERE c.mountain_id IS NOT NULL AND x.old_id IS NULL) THEN
    RAISE EXCEPTION 'Unmapped mountain_id found in schedule';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_mountains c LEFT JOIN mountain_id_mapping x ON c.mountain_id::text = x.old_id::text WHERE x.old_id IS NULL) THEN
    RAISE EXCEPTION 'Unmapped mountain_id found in user_mountains';
  END IF;
  IF EXISTS (SELECT 1 FROM public.mountain_trailheads c LEFT JOIN mountain_id_mapping x ON c.mountain_id::text = x.old_id::text WHERE x.old_id IS NULL) THEN
    RAISE EXCEPTION 'Unmapped mountain_id found in mountain_trailheads';
  END IF;
  IF EXISTS (SELECT 1 FROM public.mountain_courses c LEFT JOIN mountain_id_mapping x ON c.mountain_id::text = x.old_id::text WHERE x.old_id IS NULL) THEN
    RAISE EXCEPTION 'Unmapped mountain_id found in mountain_courses';
  END IF;
END $$;

-- Drop all foreign keys from the known mountain_id tables that reference mountains(id).
-- Querying pg_constraint avoids relying on generated constraint names.
DO $$
DECLARE
  fk record;
BEGIN
  FOR fk IN
    SELECT c.conrelid::regclass AS table_name, c.conname
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.confrelid = 'public.mountains'::regclass
      AND c.conrelid IN (
        'public.mountain_list_members'::regclass,
        'public.schedule'::regclass,
        'public.user_mountains'::regclass,
        'public.mountain_trailheads'::regclass,
        'public.mountain_courses'::regclass
      )
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.table_name, fk.conname);
  END LOOP;
END $$;

ALTER TABLE public.mountains ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.mountains ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.mountain_list_members ALTER COLUMN mountain_id TYPE text USING mountain_id::text;
ALTER TABLE public.schedule ALTER COLUMN mountain_id TYPE text USING mountain_id::text;
ALTER TABLE public.user_mountains ALTER COLUMN mountain_id TYPE text USING mountain_id::text;
ALTER TABLE public.mountain_trailheads ALTER COLUMN mountain_id TYPE text USING mountain_id::text;
ALTER TABLE public.mountain_courses ALTER COLUMN mountain_id TYPE text USING mountain_id::text;

UPDATE public.mountains m
SET id = x.new_id
FROM mountain_id_mapping x
WHERE m.id = x.old_id::text;

UPDATE public.mountain_list_members c
SET mountain_id = x.new_id
FROM mountain_id_mapping x
WHERE c.mountain_id = x.old_id::text;

UPDATE public.schedule c
SET mountain_id = x.new_id
FROM mountain_id_mapping x
WHERE c.mountain_id = x.old_id::text;

UPDATE public.user_mountains c
SET mountain_id = x.new_id
FROM mountain_id_mapping x
WHERE c.mountain_id = x.old_id::text;

UPDATE public.mountain_trailheads c
SET mountain_id = x.new_id
FROM mountain_id_mapping x
WHERE c.mountain_id = x.old_id::text;

UPDATE public.mountain_courses c
SET mountain_id = x.new_id
FROM mountain_id_mapping x
WHERE c.mountain_id = x.old_id::text;

-- Restore the original FK delete behavior.
ALTER TABLE public.mountain_list_members
  ADD CONSTRAINT mountain_list_members_mountain_id_fkey
  FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE RESTRICT;
ALTER TABLE public.schedule
  ADD CONSTRAINT schedule_mountain_id_fkey
  FOREIGN KEY (mountain_id) REFERENCES public.mountains(id);
ALTER TABLE public.user_mountains
  ADD CONSTRAINT user_mountains_mountain_id_fkey
  FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE CASCADE;
ALTER TABLE public.mountain_trailheads
  ADD CONSTRAINT mountain_trailheads_mountain_id_fkey
  FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE CASCADE;
ALTER TABLE public.mountain_courses
  ADD CONSTRAINT mountain_courses_mountain_id_fkey
  FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.mountains) <> 201 THEN
    RAISE EXCEPTION 'Post-migration mountain count is not 201';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.mountains m
    JOIN mountain_id_mapping x ON m.id = x.old_id::text
  ) THEN
    RAISE EXCEPTION 'Some old UUID IDs remain in public.mountains';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.mountains m
    LEFT JOIN mountain_id_mapping x ON m.id = x.new_id
    WHERE x.new_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Unexpected mountain ID found after migration';
  END IF;
END $$;

DROP TABLE mountain_id_mapping;
