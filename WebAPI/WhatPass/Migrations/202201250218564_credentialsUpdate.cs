namespace WhatPass.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class credentialsUpdate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Credentials", "OwnerId", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Credentials", "OwnerId");
        }
    }
}
