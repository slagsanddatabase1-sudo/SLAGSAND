ALTER TABLE public.faqs DROP COLUMN IF EXISTS display_order;
ALTER TABLE public.faqs DROP COLUMN IF EXISTS category;

INSERT INTO public.faqs (question, answer)
VALUES 
    ('What is Slag Sand?', 'Slag Sand is a manufactured fine aggregate produced from processed blast furnace slag, a by-product of steel manufacturing. It is used as a replacement for river sand or crushed sand in construction applications.'),
    ('From where is Slag Sand sourced?', 'Slag Sand is sourced from reputed steel plants and slag processing units and undergoes controlled processing before supply.'),
    ('What is the color of Slag Sand?', 'Slag Sand is usually light grey, which does not affect performance or strength.'),
    ('Who should use Slag Sand?', 'Cement product manufacturers, RMC owners, Government contractors, Private builders, and Infrastructure companies.'),
    ('Is Slag Sand safe to use in construction?', 'Yes. Slag Sand is chemically stable, non-toxic, and environmentally safe when properly processed. It has been widely used in infrastructure and industrial projects.'),
    ('Is Slag Sand approved by government authorities?', 'At present, Slag Sand is not universally notified like river sand, but it is approved in Delhi Metro. It is technically accepted and used by many private, industrial, and infrastructure contractors. Approval depends on project specifications and engineer consent.'),
    ('Does Slag Sand affect concrete strength?', 'No. When used in proper mix design, Slag Sand meets or improves strength parameters due to its angular shape and better bonding with cement.'),
    ('Will Slag Sand cause cracks in concrete or plaster?', 'No. Cracks occur due to poor curing, incorrect mix design, or workmanship, not because of Slag Sand itself.'),
    ('Does Slag Sand contain clay or silt?', 'No. Properly processed Slag Sand is free from clay, silt, and organic impurities.'),
    ('Can I get test reports for Slag Sand?', 'Yes. Sieve analysis, moisture content, and basic quality reports can be provided on request.'),
    ('What quality standards does Slag Sand follow?', 'Slag Sand is generally evaluated as per IS 383 guidelines for fine aggregates.'),
    ('Can Slag Sand replace river sand completely?', 'Yes, Slag Sand can partially or fully replace river sand depending on application, mix design, and project requirements. For First time user we recommend partial replacement.'),
    ('What are the advantages of Slag Sand over river sand?', '✅ 30% lighter than river sand\n✅ Provides approximately 30% more volume\n✅ Better particle interlocking\n✅ Uniform gradation\n✅ Eco-friendly (waste utilization)\n✅ Reduces dependency on river sand\n✅ Cost effective'),
    ('How much lighter is Slag Sand compared to river sand?', 'Slag Sand is around 25–30% lighter, which means: More coverage per ton, Lower transportation load impact, and Better volume advantage for customers.'),
    ('How does Slag Sand compare with crushed sand (M-Sand)?', 'Compared to Crushed Sand, Slag Sand is Lighter (vs Heavier), has Higher Volume (vs Lower), Low Dust (vs Sometimes high), is Eco-friendly (vs Moderate), and is an Industrial by-product (vs Natural rock).'),
    ('Why should I choose Slag Sand over river sand?', 'Because Slag Sand offers: Better volume, Stable supply, Eco-friendly solution, Cost advantage, and Consistent quality.'),
    ('Where can Slag Sand be used?', 'Slag Sand is suitable for: RCC & PCC works, Cement blocks & pavers, Ready Mix Concrete (RMC), Plastering, Road works, Precast products, Tiles, pipes, and poles.'),
    ('Is Slag Sand suitable for plastering?', 'Yes. With proper grading and mixing, Slag Sand can be used for internal and external plastering.'),
    ('Does Slag Sand absorb more water?', 'Slag Sand may have slightly higher water absorption, which can be controlled by: Proper curing, Correct water-cement ratio, and Use of admixtures if required.'),
    ('Is Slag Sand suitable for RMC plants?', 'Yes. Many RMC plants use Slag Sand after trial mix approval, as it offers consistent quality and strength.'),
    ('Is Slag Sand good for block & paver manufacturing?', 'Yes. It is widely preferred in cement block, paver, and precast industries due to: Better finish, Uniform quality, and Improved compaction.'),
    ('Is Slag Sand suitable for government projects?', 'Yes, subject to project-specific approval and engineer’s recommendation.'),
    ('Can Slag Sand be mixed with river sand or crushed sand?', 'Yes. It can be blended to optimize performance and cost.'),
    ('Is Slag Sand economical?', 'Yes. Due to its volume advantage and stable pricing, Slag Sand offers better value for money compared to river sand.'),
    ('Does Slag Sand require special handling or storage?', 'No special handling is required. Store it like normal sand in a dry and clean area.'),
    ('Is trial material available before bulk purchase?', 'Yes. Trial quantities can be supplied for testing and approval.'),
    ('How is Slag Sand supplied?', 'Slag Sand is supplied in Tippers, Trucks, or as per customer location and requirement.'),
    ('In which areas do you supply Slag Sand?', 'We supply Slag Sand across: Nagpur, Wardha, Amravati, Akola, Yavatmal, Umarkhed, and existing Vidarbha region.'),
    ('How can I place an order for Slag Sand?', 'You can place orders via Phone, WhatsApp, or Email. Bulk & regular supply contracts available.'),
    ('Is Slag Sand environmentally friendly?', 'Yes. Using Slag Sand reduces river mining, utilizes industrial waste, and supports sustainable construction.')
ON CONFLICT DO NOTHING;
