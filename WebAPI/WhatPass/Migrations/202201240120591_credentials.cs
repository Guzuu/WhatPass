namespace WhatPass.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class credentials : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CredentialsModels",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Url = c.String(),
                        Username = c.String(),
                        Password = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.CredentialsModels");
        }
    }
}
