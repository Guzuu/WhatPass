using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using WhatPass.Models;

namespace WhatPass.Controllers
{
    [Authorize]
    [RoutePrefix("api/Credentials")]
    public class CredentialsController : ApiController
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: api/Credentials
        public IQueryable<CredentialsModel> GetCredentials()
        {
            return db.Credentials;
        }

        // GET: api/Credentials/5
        [ResponseType(typeof(CredentialsModel))]
        public async Task<IHttpActionResult> GetCredentials(int id)
        {
            CredentialsModel credentials = await db.Credentials.FindAsync(id);
            if (credentials == null)
            {
                return NotFound();
            }

            return Ok(credentials);
        }

        // PUT: api/Credentials/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutCredentials(int id, CredentialsModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != credentials.Id)
            {
                return BadRequest();
            }

            db.Entry(credentials).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CredentialsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Credentials
        [ResponseType(typeof(CredentialsModel))]
        public async Task<IHttpActionResult> PostCredentials(CredentialsModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Credentials.Add(credentials);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = credentials.Id }, credentials);
        }

        // DELETE: api/Credentials/5
        [ResponseType(typeof(CredentialsModel))]
        public async Task<IHttpActionResult> DeleteCredentials(int id)
        {
            CredentialsModel credentials = await db.Credentials.FindAsync(id);
            if (credentials == null)
            {
                return NotFound();
            }

            db.Credentials.Remove(credentials);
            await db.SaveChangesAsync();

            return Ok(credentials);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CredentialsExists(int id)
        {
            return db.Credentials.Count(e => e.Id == id) > 0;
        }
    }
}