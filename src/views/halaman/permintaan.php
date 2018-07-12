
        <div class="col-12">
            <div class="card">
                <button class="btn btn-success" onClick="tambah_modal()">Tambah Surat</button>
            </div>
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Permintaan</h3>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                  <table id="table-pengguna" class="table table-sm table-striped">
                    <thead class="bg-warning">
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Peminta</th>
                        <th>Nama barang</th>
                        <th>Banyaknya</th>
                        <th>Dengan huruf</th>
                        <th>Keterangan</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                1
                            </td>
                            <td>
                                2018-07-02
                            </td>
                            <td>
                                Bpk. Masrul
                            </td>
                            <td>
                                Sepatu
                            </td>
                            <td>
                                2
                            </td>
                            <td>
                                dua buah
                            </td>
                            <td>
                                dipinjam
                            </td>
                            <td>
                                masih terpinjam
                            </td>
                            <td>
                            <i class="left fa fa-pencil" style="cursor : pointer" onClick="ubah_modal()"></i><span style="cursor : pointer" onClick="ubah_modal()"> Edit</span>
                            </td>
                        </tr>
                    </tbody>
                  </table>
                </div>
            </div>
            <!-- /.card-body -->
          </div>
          
        <div id="ubah_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Ubah</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                  <div class="form-group" hidden>
                    <label class="control-label col-sm-2">Id Pengguna :</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="id_pengguna_ubah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Tipe :</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="tipe_ubah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Nama :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="nama_ubah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Jenis Kelamin :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="jenis_kelamin_ubah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Tanggal Lahir :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="tanggal_lahir_ubah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Email :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="email_ubah">
                    </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="button_save_ubah">Save changes</button>
              </div>
            </div>
          </div>
        </div>

        <div id="tambah_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Ubah</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                  <div class="form-group">
                    <label class="control-label col-sm-2">No</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="no_tambah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Nama Barang :</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="nama_barang_tambah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Banyaknya :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="banyaknya_tambah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Dengan Huruf :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="dengan_huruf_tambah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Keterangan :</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="keterangan_tambah">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-2">Status</label>
                    <div class="col-sm-10"> 
                        <input class="form-control" id="status_tambah">
                    </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="button_save_ubah">Save changes</button>
              </div>
            </div>
          </div>
        </div>
        
        <div id="detail_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Ubah</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Id Pengguna</label>
                <div class="col-sm-10">
                        <input class="form-control form-control-sm" id="id_pengguna_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Tipe</label>
                <div class="col-sm-10">
                        <input class="form-control form-control-sm" id="tipe_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Nama</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="nama_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Jenis Kelamin</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="jenis_kelamin_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Tanggal Lahir</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="tanggal_lahir_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Email</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="email_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Nomor Telepon</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="nomor_telepon_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Buat Pada</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="buat_pada_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Ubah Pada</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="ubah_pada_detail">
                    </div>
                </div>
                <div class="form-group">
                <label class="col-sm-2 col-form-label col-form-label-sm">Hapus Pada</label>
                    <div class="col-sm-10"> 
                        <input class="form-control form-control-sm" id="hapus_pada_detail">
                    </div>
                </div>  
              </div>
            </div>
          </div>
        </div>
        
        <div id="notif_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-body">
              </div>
            </div>
          </div>
        </div>
          
        <script type="text/javascript">
            var table;
            
            $(document).ready(
                function(){
                    table = $('#table-pengguna').DataTable(
                        {
                            'columnDefs': [
                            {
                                'targets': [ -1 ],
                                'orderable': false,
                            } 
                        ]
                        }
                    );
                }
            );
            
            
            function ubah_modal(id_pengguna){
                $('#ubah_modal').modal('show');
            }
            
            function tambah_modal(id_pengguna){
                $('#tambah_modal').modal('show');
            }
            
            /*
            function ubah_process(id_pengguna){
                $.ajax({
                    url : "<?php echo base_url()?>index.php/pengguna/ubah_dengan_id",
                    header : {
                        "Content-type" : "applocation/application/x-www-form-urlencoded"
                    },
                    type : "put",
                    dataType : "json",
                    data : {
                        "id_pengguna" : id_pengguna,
                        "tipe" : $('#tipe_ubah').val(),
                        "nama" : $('#nama_ubah').val(),
                        "jenis_kelamin" : $('#jenis_kelamin_ubah').val(),
                        "tanggal_lahir" : $('#tanggal_lahir_ubah').val(),
                        "email" : $('#email_ubah').val()
                    },
                    success : function(response){
                        $('#ubah_modal').modal('hide');
                        $('#notif_modal').modal('show');
                        if(!response.status){
                            $("#notif_modal div div div").html('gagal ubah');
                        }else{
                            $("#notif_modal div div div").html('sukses ubah');
                        }
                        setTimeout(function(){
                            $('#notif_modal').modal('hide');
                        }, 1000);
                        
                        reload_table();
                    },
                    error : function(){
                        $("#notif_modal div div div").html('sukses hapus');
                        setTimeout(function(){
                            $('#notif_modal').modal('hide');
                        }, 1000);
                    }
                });
            }

            function detail_modal(id_pengguna){
                $('#detail_modal').modal('show');
                $.ajax({
                    url : "<?php echo base_url()?>index.php/pengguna/ambil_semua_dengan_id",
                    header : {
                        "Content-type" : "applocation/application/x-www-form-urlencoded"
                    },
                    type : "get",
                    dataType : "json",
                    data : {
                        "id_pengguna" : id_pengguna  
                    },
                    success : function(response){
                        $('#id_pengguna_detail').val(response.id_pengguna);
                        $('#tipe_detail').val(response.tipe);
                        $('#nama_detail').val(response.nama);
                        $('#jenis_kelamin_detail').val(response.jenis_kelamin);
                        $('#tanggal_lahir_detail').val(response.tanggal_lahir);
                        $('#email_detail').val(response.email);
                        $('#path_gambar_detail').val(response.email);
                        $('#buat_pada_detail').val(response.buat_pada);
                        $('#ubah_pada_detail').val(response.ubah_pada);
                        $('#hapus_pada_detail').val(response.hapus_pada);
                        
                        reload_table();
                    },
                    error : function(){
                        setTimeout(function(){
                            $('#notif_modal').modal('hide');
                        }, 1000);
                    }
                });
            }
            
            function hapus_process(id_pengguna){
                $.ajax({
                    url : "<?php echo base_url()?>index.php/pengguna/hapus_dengan_id/"+id_pengguna,
                    header : {
                        "Content-type" : "applocation/application/x-www-form-urlencoded"
                    },
                    type : "delete",
                    dataType : "json",
                    data : {
                        'id_pengguna' : id_pengguna  
                    },
                    success : function(response){
                        $('#hapus_modal').modal('hide');
                        $('#notif_modal').modal('show');
                        if(!response.status){
                            $("#notif_modal div div div").html('gagal hapus');
                        }else{
                            $("#notif_modal div div div").html('sukses hapus');
                        }
                        setTimeout(function(){
                            $('#notif_modal').modal('hide');
                        }, 1000);
                        
                        reload_table();
                    },
                    error : function(){
                        $("#notif_modal div div div").html('sukses hapus');
                        setTimeout(function(){
                            $('#notif_modal').modal('hide');
                        }, 1000);
                    }
                });
            }
            */
            
            
            function reload_table(){
                table.ajax.reload(null,false);
            }
        </script>