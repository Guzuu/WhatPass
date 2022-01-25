namespace WhatPass.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class initial : DbMigration
    {
        public override void Up()
        {
            DropTable("dbo.CredentialsModels");
        }
        
        public override void Down()
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
    }
}
