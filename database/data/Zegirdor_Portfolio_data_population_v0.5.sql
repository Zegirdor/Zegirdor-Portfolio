/* Populate in this order: add the technology reference rows, add the project to Repository,
then link them through the junction table. INSERT ... RETURNING ID can show you the IDs to
use for those links. */

-- Select * From Technology;
-- Select * From Repository;
-- Select * From Repository_Technology;

Insert Into Technology (Name, Category, Proficiency) Values
('PHP', 'language', 'proficient'),
('Java', 'language', 'high'),
('C#', 'language', 'average'),
('JavaScript', 'language', 'proficient'),
('HTML5', 'language', 'proficient'),
('CSS', 'language', 'proficient'),
('SQL', 'language', 'very high'),
('Node.js', 'tool', 'high'),
('Angular.JS', 'framework', 'high'),
('PostgreSQL', 'database', 'proficient'),
('SQL Server', 'database', 'high'),
('Git', 'tool', 'very high'),
('GitHub', 'tool', 'proficient'),
('Claude Code', 'tool', 'proficient'),
('Codex', 'tool', 'proficient'),
('Postman', 'tool', 'average'),
('Vue.js', 'framework', 'average'),
('Vite', 'tool', 'average'),
('PrimeVue', 'library', 'proficient'),
('Vue I18n', 'library', 'high'),
('Express.JS', 'framework', 'high'),
('Tailwind CSS', 'framework', 'high')
On Conflict (Name) Do Update Set Name = Excluded.Name, Category = Excluded.Category, Proficiency = Excluded.Proficiency;

Insert Into Repository (Name, Description, Git_Repository_URL, Demo_URL, Screenshot_Path, Version, Project_Date, Authors, Completion_Percent, Is_Visible, Display_Order)
Values
(
	'{"es": "Invitación de Boda", "en": "Wedding Invitation"}',
	E'{"es": "Una página web creada para funcionar como una invitación para mi boda. La desarrollé en NodeJS, usando Vite como la herramienta de ensamblado, y Tailwind como biblioteca para los componentes.", "en": "A Web based invitation card used at my wedding. I built it using NodeJS with Vite as the build tool, and Tailwind as the component\'s library."}',
	'https://github.com/Zegirdor/wedding-invitation',
	'https://wedding.zegirdordev.com/',
	'/mnt/hdd320_1/assets/zegirdor_portfolio/Wedding Invitation Screenshot 1.png', /* Example path */
	'1.0.2',
	'2026/08/02'::Date,
	Array['Luis Ángel Moreno']::Text[],
	100,
	True,
	0
)
On Conflict (Git_Repository_URL) Do Update Set Name = Excluded.Name, Description = Excluded.Description, Demo_URL = Excluded.Demo_URL, Screenshot_Path = Excluded.Screenshot_Path, Version = Excluded.Version, Project_Date = Excluded.Project_Date, Authors = Excluded.Authors, Completion_Percent = Excluded.Completion_Percent, Is_Visible = Excluded.Is_Visible, Display_Order = Excluded.Display_Order;

With Tech_References(Repo_Name_EN, Tech_Name) As (
    Values
        ('Wedding Invitation', 'JavaScript'),
        ('Wedding Invitation', 'HTML5'),
        ('Wedding Invitation', 'CSS'),
        ('Wedding Invitation', 'Node.js'),
        ('Wedding Invitation', 'Git'),
        ('Wedding Invitation', 'GitHub'),
        ('Wedding Invitation', 'Vite'),
        ('Wedding Invitation', 'Tailwind CSS')
)
Insert Into Repository_Technology (Repository_ID, Technology_ID)
Select Repo.ID, Tech.ID
From Tech_References Rech_Ref
Join Repository Repo ON Repo.Name ->> 'en' = Rech_Ref.repo_name_en
Join Technology Tech ON Tech.Name = Rech_Ref.tech_name
On Conflict (Repository_ID, Technology_ID) Do Update Set Technology_ID = Excluded.Technology_ID;